import { EventEmitter } from 'stream';
import AsyncLock from 'async-lock';
import dgram from 'dgram';
import RE2 from 're2';

import { DevicePackInfo, FoundDevice } from '../@types';
import Crypto from '../utils/Crypto';
import config from '../config.json';
import { SCAN } from './Commands';
import Device from './Device';
import Logger from './Logger';
import Socket from './Socket';

const lock = new AsyncLock({
  timeout: 240 * 1000
});

const events: {
  deviceFound: 'device-found';
} = {
  deviceFound: 'device-found'
};

type Events = typeof events;
type ValueOf<T> = T[keyof T];
type EventNames = ValueOf<Events>;

type ScanReturn<T extends number> = T extends 0 ? void : Device[];

export default abstract class DeviceFinder {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}
  private static readonly PORT = 7000;
  private static canScanForMore: boolean = true;

  private static readonly eventHandler: EventEmitter = new EventEmitter();
  private static foundDevices: Device[] = [];

  public static on(event: EventNames, callback: (device: Device) => void) {
    if (!Object.values(events).includes(event)) {
      return;
    }

    this.eventHandler.on(event, callback);
  }

  /**
   * If you want to always scan for devices, just set the max devices to 0 and use
   * the `.on` function to receive the devices.
   * (the return method for this method it will be [] in this case)
   *
   * If you don't want that feature, the best option to go is the `waitForDevices` method
   *
   * @param {string} broadcast
   * @param {number} maxDevices It has to be >= 0
   * @param {number} timeout (in ms) When to abort when no device was found or
   * if `maxDevices` is set to 0, how often to scan for devices.
   * Minimum is 3 seconds (3000 ms)
   * @returns {Device[]}
   */
  public static async scan<T extends number>(
    broadcast: string,
    maxDevices: T = config.stopSearchingAtDevices as any,
    timeout: number = config.searchTimeout * 1000
  ): Promise<ScanReturn<T>> {
    if (!this.canScanForMore) {
      return [] as any;
    }

    const ipCheck = new RE2(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    );

    if (!broadcast || !ipCheck.test(broadcast)) {
      throw new Error('Invalid broadcast address.');
    }

    if (maxDevices < 0) {
      throw new Error("Can't search for negative values");
    }

    if (timeout < 3000) {
      throw new Error('The timeout it has to be greater than 3 seconds');
    }

    if (maxDevices > 0) {
      return lock.acquire<Device[]>('device-scan', async () => {
        Logger.log('Scanning for devices.');

        let devices: Device[] = [];
        const socket = new Socket(broadcast, this.PORT, timeout, {
          checkResolve: () => devices.length > 0,
          onMessage: (msg, rinfo) => {
            const data: FoundDevice = JSON.parse(msg.toString('utf-8'));
            const pack: DevicePackInfo = JSON.parse(Crypto.decrypt(data.pack));

            devices = [...devices, new Device(rinfo.address, rinfo.port, pack)];
            return devices.length >= maxDevices;
          }
        });

        await socket.send(SCAN);
        Logger.log('Devices found:', devices.length);
        await Promise.all(devices.map((device) => device.bind()));

        return devices;
      }) as any;
    }

    this.canScanForMore = false;

    const socket = dgram.createSocket('udp4');
    socket.on('listening', () => {
      socket.setBroadcast(true);
    });

    socket.on('error', (err) => {
      Logger.error(err);
    });

    socket.on('message', (msg, rinfo) => {
      lock.acquire('device-setup', async () => {
        try {
          const data: FoundDevice = JSON.parse(msg.toString('utf-8'));
          const pack: DevicePackInfo = JSON.parse(Crypto.decrypt(data.pack));

          const existingDevice = this.foundDevices.find(
            (device) => device.Mac === pack.mac
          );

          if (existingDevice) {
            if (!existingDevice.compare(rinfo.address, rinfo.port, pack)) {
              existingDevice.updatePack(rinfo.address, rinfo.port, pack);
              await existingDevice.bind();
            }

            return;
          }

          const newDevice = new Device(rinfo.address, rinfo.port, pack);
          this.foundDevices.push(newDevice);
          await newDevice.bind();

          if (this.eventHandler.listenerCount(events.deviceFound) === 0) {
            Logger.warn('No listeners are on device discovery');
          } else {
            this.eventHandler?.emit(events.deviceFound, newDevice);
          }
        } catch (err) {
          Logger.error(err);
        }
      });
    });

    const scan = () => {
      Logger.log('Scanning for devices.');
      socket.send(SCAN, 0, SCAN.length, this.PORT, broadcast, (err) => {
        if (err) {
          Logger.error(err);
        }
      });
    };

    scan();
    setInterval(scan, timeout);

    return undefined as any;
  }
}

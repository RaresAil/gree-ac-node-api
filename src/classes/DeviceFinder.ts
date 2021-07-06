import AsyncLock from 'async-lock';
import RE2 from 're2';

import { DevicePackInfo, FoundDevice } from '../@types';
import Crypto from '../utils/Crypto';
import { SCAN } from './Commands';
import Device from './Device';
import Logger from './Logger';
import Socket from './Socket';

const lock = new AsyncLock({
  timeout: 240 * 1000
});

export default abstract class DeviceFinder {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  public static async scan(
    broadcast: string,
    maxDevices: number = 1,
    timeout: number = 30 * 1000
  ): Promise<Device[]> {
    return lock.acquire<Device[]>('device-scan', async () => {
      const ipCheck = new RE2(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      );

      if (!broadcast || !ipCheck.test(broadcast)) {
        throw new Error('Invalid broadcast address.');
      }

      if (maxDevices <= 0) {
        throw new Error("Can't search for zero or negative values");
      }

      Logger.log('Scanning for devices.');

      let devices: Device[] = [];
      const socket = new Socket(broadcast, 7000, timeout, {
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
    });
  }
}

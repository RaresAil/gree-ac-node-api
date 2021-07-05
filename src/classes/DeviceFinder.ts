import dgram from 'dgram';
import RE2 from 're2';

import { DevicePackInfo, FoundDevice } from '../@types';
import Crypto from '../utils/Crypto';
import { SCAN } from './Commands';
import Device from './Device';
import Logger from './Logger';

export default abstract class DeviceFinder {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  public static async scan(
    broadcast: string,
    maxDevices: number = 1,
    timeout: number = 30 * 1000
  ): Promise<Device[]> {
    const client = dgram.createSocket('udp4');

    const ipCheck = new RE2(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    );

    if (!broadcast || !ipCheck.test(broadcast)) {
      throw new Error('Invalid broadcast address.');
    }

    if (maxDevices <= 0) {
      throw new Error("Can't search for zero or negative values");
    }

    let devices: Device[] = [];
    return new Promise((resolve, reject) => {
      const createTimeout = () =>
        setTimeout(() => {
          if (devices.length > 0) {
            return cleanResolve();
          }

          cleanReject(new Error('TIMEOUT'));
        }, timeout);

      let timeoutData = createTimeout();

      const cleanReject = (error: Error) => {
        client.close();
        reject(error);
      };

      const cleanResolve = (complete: boolean = false) => {
        Logger.log(
          'Devices found:',
          devices.length,
          ...(complete ? [] : ['|', 'Timeout.'])
        );
        clearTimeout(timeoutData);
        resolve(devices);
        client.close();
      };

      client.send(SCAN, 0, SCAN.length, 7000, broadcast, (err) => {
        if (err) {
          cleanReject(err);
        }
      });

      client.on('listening', () => {
        Logger.log('Scanning for devices.');
        client.setBroadcast(true);
      });

      client.on('error', (err) => {
        cleanReject(err);
      });

      client.on('message', (msg, rinfo) => {
        try {
          const data: FoundDevice = JSON.parse(msg.toString('utf8'));
          const pack: DevicePackInfo = JSON.parse(Crypto.decrypt(data.pack));

          devices = [
            ...devices,
            new Device(rinfo.address, rinfo.port, pack.cid, pack.name)
          ];

          if (devices.length >= maxDevices) {
            cleanResolve(true);
          } else {
            clearTimeout(timeoutData);
            timeoutData = createTimeout();
          }
        } catch (err) {
          cleanReject(err);
        }
      });
    });
  }
}

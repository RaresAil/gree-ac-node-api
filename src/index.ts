import DeviceFinder from './classes/DeviceFinder';
import Device from './classes/Device';
import Logger from './classes/Logger';
import config from './config.json';

export async function waitForDevices(
  address: string,
  maxDevices: number = config.stopSearchingAtDevices
): Promise<Device[]> {
  let devices: Device[] = [];

  do {
    try {
      devices = await DeviceFinder.scan(address, maxDevices);
    } catch (err) {
      if (err.message !== 'TIMEOUT') {
        throw err;
      }

      Logger.error(err);
    }
  } while (devices.length === 0);

  return devices;
}

waitForDevices(config.broadcastAddress);

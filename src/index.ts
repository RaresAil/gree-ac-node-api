import Device from './classes/Device';
import DeviceFinder from './classes/DeviceFinder';
import Logger from './classes/Logger';

export async function waitForDevices(
  address: string,
  maxDevices: number = 1
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

waitForDevices('192.168.50.255');

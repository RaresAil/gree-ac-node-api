import DeviceFinder from './classes/DeviceFinder';
import Device from './classes/Device';
import Logger from './classes/Logger';
import config from './config.json';

/**
 * This method is waiting for at least 1 device to be found.
 *
 * If you want to always keep looking for devices, use
 * `DeviceFinder.scan(address, 0)` and subscribe to
 * `DeviceFinder.on("device-found", (device) => {})` in order
 * to receive the new found devices.
 *
 * @param {string} address The router's broadcast address
 * @param {number} maxDevices It has to be > 0
 * @returns {Device[]}
 */
export default async function waitForDevices(
  address: string,
  maxDevices: number = config.stopSearchingAtDevices
): Promise<Device[]> {
  if (maxDevices === 0) {
    throw new Error(
      'If you want to always search for devices, call DeviceFinder.scan(address, 0) and DeviceFinder.on("device-found", (device) => {})'
    );
  }

  if (maxDevices < 0) {
    throw new Error("Can't search for negative values");
  }

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

import AsyncLock from 'async-lock';

import Commands, { BIND, createRequest, CommandsOutput } from './Commands';
import { DeviceFullInfo, DevicePackInfo, Obj, Status } from '../@types';
import Crypto from '../utils/Crypto';
import Socket from './Socket';
import Logger from './Logger';

type CommandsType = typeof Commands;

export default class Device {
  private readonly lock: AsyncLock;

  private key?: string;

  private pack!: DevicePackInfo;
  private port!: number;
  private ip!: string;

  public get Mac() {
    return this.pack.mac;
  }

  public get FullInfo(): DeviceFullInfo {
    return {
      mac: this.pack.mac.toString(),
      id: this.pack.cid.toString(),
      port: parseInt(this.port.toString()),
      ip: this.ip.toString()
    };
  }

  public get Name() {
    return this.pack.name ?? '<unknown>';
  }

  public constructor(ip: string, port: number, pack: DevicePackInfo) {
    this.lock = new AsyncLock();
    this.updatePack(ip, port, pack);
  }

  public compare(ip: string, port: number, pack: DevicePackInfo): boolean {
    return (
      ip === this.ip &&
      port === this.port &&
      pack.cid === this.pack.cid &&
      pack.mac === this.pack.mac
    );
  }

  /**
   * This method is used on device discovery, using this might break
   * the device's communication!!!
   */
  public updatePack(ip: string, port: number, pack: DevicePackInfo) {
    this.pack = pack;
    this.port = port;
    this.ip = ip;
  }

  /**
   * This method is used on device discovery, using this might break
   * the device's communication!!!
   */
  public async bind(): Promise<void> {
    return this.lock.acquire('device-bind', async () => {
      Logger.log('Binding device:', this.pack.mac);

      const command = createRequest(
        Crypto.encrypt(BIND(this.pack.mac)),
        this.pack.mac,
        1
      );

      const response = await this.sendData(command);
      if (!response) {
        return;
      }

      const responseData = JSON.parse(response);
      const pack = JSON.parse(Crypto.decrypt(responseData.pack));

      if (!pack?.key) {
        Logger.error('Unable to get the device key.');
        return;
      }

      this.key = pack.key;
      Logger.log('Device bound:', this.pack.mac);
    });
  }

  private async sendData(data: Buffer): Promise<string | null> {
    return this.lock.acquire<string | null>('device-send-data', async () => {
      try {
        let response: string | null = null;
        const socket = new Socket(this.ip, this.port, 5 * 1000, {
          onMessage: (msg) => {
            response = msg.toString('utf-8');
            return true;
          }
        });

        await socket.send(data);
        return response;
      } catch (err) {
        Logger.error(err);
        return null;
      }
    });
  }

  /**
   * Use this method to send commands to the device
   * @param {string} command
   * @param {any} value
   * @returns {any | null}
   */
  public async sendCommand<T = any>(
    command: keyof CommandsType,
    value: Partial<Status> = {}
  ): Promise<Obj<T> | null> {
    if (!this.key) {
      Logger.error('This device is not bound!');
      return null;
    }

    const parsedCommand = Commands[command.toString() as typeof command](
      this.pack.mac,
      this.key,
      value
    );

    const result = await this.sendData(parsedCommand);
    if (!result || !JSON.parse(result)?.pack) {
      return null;
    }

    const resultData = JSON.parse(result);
    const pack = JSON.parse(Crypto.decrypt(resultData.pack, this.key));
    const parseOutput: any =
      CommandsOutput[command.toString()] ?? ((pack: any) => pack);

    return parseOutput(pack, value) as Obj<T>;
  }
}

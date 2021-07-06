import AsyncLock from 'async-lock';

import Commands, { BIND, createRequest, CommandsOutput } from './Commands';
import { DevicePackInfo, Obj, Status } from '../@types';
import Crypto from '../utils/Crypto';
import Socket from './Socket';
import Logger from './Logger';

type CommandsType = typeof Commands;

export default class Device {
  private readonly GENERIC_KEY: string = 'a3K8Bx%2r8Y7#xDh';
  private readonly lock: AsyncLock;

  private key?: string;

  private pack: DevicePackInfo;
  private port: number;
  private ip: string;

  public get Id() {
    return this.pack.cid;
  }

  public get Name() {
    return this.pack.name ?? '<unknown>';
  }

  public get IsBound() {
    return !!this.key;
  }

  public constructor(ip: string, port: number, pack: DevicePackInfo) {
    this.lock = new AsyncLock();
    this.pack = pack;
    this.port = port;
    this.ip = ip;
  }

  public async bind(): Promise<void> {
    return this.lock.acquire('device-bind', async () => {
      if (this.IsBound) {
        Logger.error(`The device '${this.pack.mac}' was already bound.`);
        return;
      }

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

  public async sendCommand<T = any>(
    command: keyof CommandsType,
    value: Partial<Status> = {}
  ): Promise<Obj<T> | null> {
    if (!this.IsBound) {
      Logger.error('This device is not bound!');
      return null;
    }

    const parsedCommand = Commands[command.toString() as typeof command](
      this.pack.mac,
      this.key!,
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

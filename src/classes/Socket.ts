import dgram from 'dgram';

type OnMessageEvent = (msg: Buffer, rinfo: dgram.RemoteInfo) => boolean;

type CheckResolve = () => boolean;

export default class Socket {
  private readonly timeout: number;
  public readonly port: number;
  public readonly ip: string;

  private readonly checkResolve: CheckResolve;
  private readonly onMessage: OnMessageEvent;

  public constructor(
    ip: string,
    port: number,
    timeout: number,
    events: {
      checkResolve?: CheckResolve;
      onMessage?: OnMessageEvent;
    } = {}
  ) {
    this.checkResolve = events.checkResolve ?? (() => false);
    this.onMessage = events.onMessage ?? (() => true);
    this.timeout = timeout;
    this.port = port;
    this.ip = ip;
  }

  public async send(data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      const createTimeout = () =>
        setTimeout(() => {
          if (this.checkResolve()) {
            return cleanResolve();
          }

          cleanReject(new Error('TIMEOUT'));
        }, this.timeout);

      let timeoutData = createTimeout();

      const cleanReject = (error: Error) => {
        socket.close();
        reject(error);
      };

      const cleanResolve = () => {
        clearTimeout(timeoutData);
        resolve();
        socket.close();
      };

      socket.on('listening', () => {
        socket.setBroadcast(true);
      });

      socket.on('error', (err) => {
        cleanReject(err);
      });

      socket.on('message', (msg, rinfo) => {
        try {
          if (this.onMessage(msg, rinfo)) {
            cleanResolve();
          } else {
            clearTimeout(timeoutData);
            timeoutData = createTimeout();
          }
        } catch (err) {
          cleanReject(err);
        }
      });

      socket.send(data, 0, data.length, this.port, this.ip, (err) => {
        if (err) {
          cleanReject(err);
        }
      });
    });
  }
}

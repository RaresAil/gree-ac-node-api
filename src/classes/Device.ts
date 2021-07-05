export default class Device {
  private readonly GENERIC_KEY: string = 'a3K8Bx%2r8Y7#xDh';

  private name: string = '<unknown>';
  private port: number = 0;
  private ip: string = '';
  private id: string = '';

  public constructor(ip: string, port: number, id: string, name?: string) {
    this.name = name ?? '<unknown>';
    this.port = port;
    this.id = id;
    this.ip = ip;
  }
}

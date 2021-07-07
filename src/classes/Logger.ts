/* eslint-disable no-useless-constructor */
import debug from 'debug';

const pk = require('../../package.json');
const logDebug = debug(`${pk.name}:log`);
const errorDebug = debug(`${pk.name}:error`);
const warnDebug = debug(`${pk.name}:warn`);

export default abstract class Logger {
  private constructor() {}

  public static log(...args: any[]) {
    (logDebug as any)(...args);
  }

  public static error(...args: any[]) {
    (errorDebug as any)(...args);
  }

  public static warn(...args: any[]) {
    (warnDebug as any)(...args);
  }
}

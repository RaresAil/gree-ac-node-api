/* eslint-disable no-useless-constructor */
import debug from 'debug';

import config from '../config.json';

const logDebug = debug(`${config.appName}:log`);
const errorDebug = debug(`${config.appName}:error`);

debug.enable(`${config.appName}:*`);

export default abstract class Logger {
  private constructor() {}

  public static log(...args: any[]) {
    (logDebug as any)(...args);
  }

  public static error(...args: any[]) {
    (errorDebug as any)(...args);
  }
}

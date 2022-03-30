import { SpiderGlobal } from './SpiderGlobal';

export class SpiderConsole {
  private _global: SpiderGlobal;
  private _context?: string;

  constructor(global: SpiderGlobal, context?: string) {
    this._global = global;
    this._context = context;
  }

  log(message?: any, ...optionalParams: any[]) {
    if (this._global.showLog) {
      if (this._context) {
        console.log('[spider]', this._context, message, ...optionalParams); // eslint-disable-line
      } else {
        console.log('[spider]', message, ...optionalParams); // eslint-disable-line
      }
    }
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (this._context) {
      console.warn('[spider]', this._context, message, ...optionalParams); // eslint-disable-line
    } else {
      console.warn('[spider]', message, ...optionalParams); // eslint-disable-line
    }
  }

  static log(message?: any, ...optionalParams: any[]) {
    console.log('[spider]', message, ...optionalParams); // eslint-disable-line
  }
}

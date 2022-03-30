import hackRequest, { addBeforeInterceptor, addAfterInterceptor } from './hackRequest';
import { SpiderConsole } from './Console';
import { SpiderGlobal } from './SpiderGlobal';
import { InterceptorType, InterceptorFunctionType, IRequestTrace } from '../interface';

export class RequestWatcher extends SpiderConsole {
  private _interceptors = new Map<InterceptorType, InterceptorFunctionType[]>();

  private _isInited = false;

  private _whiteUrls?: string[];

  constructor(global: SpiderGlobal) {
    super(global, 'requestWatcher');

    this._interceptors.set(InterceptorType.beforeSendRequest, []);
    this._interceptors.set(InterceptorType.afterRecieveResponse, []);
    // hack 请求
    hackRequest();
  }

  private traverseInterceptor(type: InterceptorType, trace: IRequestTrace): IRequestTrace {
    try {
      const ints = this._interceptors.get(type);
      if (ints) {
        for (let intcep of ints) {
          trace = intcep.call(window, trace);
        }
      }
      return trace;
    } catch (e) {
      this.log(e);
      return trace;
    }
  }

  init(whiteUrlList?: string[]) {
    if (whiteUrlList) {
      if (this._whiteUrls) {
        this._whiteUrls.push(...whiteUrlList);
      } else {
        this._whiteUrls = whiteUrlList;
      }
    }
    if (this._isInited) {
      return;
    }
    this._isInited = true;
    addBeforeInterceptor((config) => {
      if (this._whiteUrls && this._whiteUrls.length > 0 && this._whiteUrls.some((url) => config.url.includes(url))) {
        return config;
      }
      return this.traverseInterceptor(InterceptorType.beforeSendRequest, config);
    });
    addAfterInterceptor((config) => {
      if (this._whiteUrls && this._whiteUrls.length > 0 && this._whiteUrls.some((url) => config.url.includes(url))) {
        return config;
      }
      return this.traverseInterceptor(InterceptorType.afterRecieveResponse, config);
    });
  }

  on(type: InterceptorType, fn: InterceptorFunctionType) {
    let ints = this._interceptors.get(type);
    if (!ints) {
      ints = [];
      this._interceptors.set(type, ints);
    }
    if (type === InterceptorType.beforeSendRequest) {
      ints.unshift(fn);
    } else {
      ints.push(fn);
    }
  }
}

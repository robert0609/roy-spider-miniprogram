import { BaseTrack } from './BaseTrack';
import { RequestWatcher } from '../utils/RequestWatcher';
import UrlParser from 'url-parse';
import { SpiderGlobal } from '../utils/SpiderGlobal';
import { InterceptorType, IRequestTrace } from '../interface';

interface IReqMapValue {
  startTime: number;
}

export class PerApiTrack extends BaseTrack {
  private reqMap: Map<string, IReqMapValue> = new Map();

  constructor(private global: SpiderGlobal, private requestWatcher: RequestWatcher) {
    super(global);

    // 添加ajax拦截器
    this.requestWatcher.on(InterceptorType.beforeSendRequest, (trace: IRequestTrace) => {
      if (trace.headers && trace.headers[this.global.requestTrackIdKey]) {
        this.reqMap.set(trace.headers[this.global.requestTrackIdKey] as string, {
          startTime: Date.now()
        });
      }
      return trace;
    });
    // 添加ajax拦截器
    this.requestWatcher.on(InterceptorType.afterRecieveResponse, (trace: IRequestTrace) => {
      // 只要有response返回，不管结果是否200，都记录一下时间
      if (trace.headers && trace.headers[this.global.requestTrackIdKey]) {
        let requestId = trace.headers[this.global.requestTrackIdKey] as string;
        let reqMapValue = this.reqMap.get(requestId);
        if(!reqMapValue) return trace;
        // 清除计时的缓存
        this.reqMap.delete(requestId);

        let startTime = reqMapValue.startTime;
        let endTime = Date.now();

        const cb = this.global.trackHandlers.perApi;
        if (cb) {
          cb({
            url: trace.url,
            trace,
            totalDuration: endTime - startTime,
            ...this.perApiTiming(trace.url)
          });
        }
      }

      return trace;
    });
  }

  init(): void {
    this.requestWatcher.init(this.global.whiteApiUrls);
  }

  perApiTiming(url: string): {
    redirectDuration?: number;
    dnsDuration?: number;
    connectDuration?: number;
    requestDuration?: number;
    responseDuration?: number;
    rawPerformance?: PerformanceResourceTiming;
  } {
    const fullUrl = (new UrlParser(url)).href;
    let p: PerformanceEntry | undefined;

    let entries = window.performance.getEntriesByName(fullUrl);
    if (entries && entries.length > 0) {
      p = entries[entries.length - 1];
    } else {
      entries = window.performance.getEntriesByType('resource');
      if (entries && entries.length > 0) {
        for (let i = entries.length - 1; i >= 0; --i) {
          const o = entries[i];
          if (o.name === fullUrl || o.name.startsWith(fullUrl) || fullUrl.startsWith(o.name)) {
            p = o;
            break;
          }
        }
      }
    }

    if (p) {
      const {redirectStart, redirectEnd, domainLookupStart, domainLookupEnd, connectStart, connectEnd, requestStart, responseStart, responseEnd } = p as PerformanceResourceTiming;
      return {
        ['redirectDuration']: redirectEnd - redirectStart,
        ['dnsDuration']: domainLookupEnd - domainLookupStart,
        ['connectDuration']: connectEnd - connectStart,
        ['requestDuration']: responseStart - requestStart,
        ['responseDuration']: responseEnd - responseStart,
        rawPerformance: (p as PerformanceResourceTiming).toJSON()
      };
    } else {
      return {};
    }
  }
}

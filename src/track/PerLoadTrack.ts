import { BaseTrack } from './BaseTrack';
import { SpiderGlobal } from '../utils/SpiderGlobal';
import { PerPageLoadArgs } from '../interface/Track';

export class PerLoadTrack extends BaseTrack {
  constructor(private global: SpiderGlobal) {
    super(global);
  }

  init(): void {
    this.performanceLoadTrack();
  }

  // per_load 加载性能事件
  private performanceLoadTrack(): void {
    window.setTimeout(() => {
      const {navigationStart, domInteractive, domLoading, responseEnd, responseStart, loadEventEnd, domainLookupStart, domainLookupEnd, connectStart, connectEnd, requestStart } = window.performance.timing

      if (loadEventEnd > 0) {
        // 已经触发了load事件则上报
        // 性能数据
        const performanceData: PerPageLoadArgs = {
          ['connectDuration']: connectEnd - connectStart,
          ['dnsDuration']: domainLookupEnd - domainLookupStart,
          ['loadingDuration']: loadEventEnd - navigationStart,
          ['whiteScreenDuration']: responseStart - navigationStart,
          ['requestDuration']: responseStart - requestStart,
          domParseDuration: domInteractive - domLoading,
          ['domReadyDuration']: domInteractive - navigationStart,
          docDuration: responseEnd - responseStart,
          rawPerformance: window.performance.timing.toJSON()
          // ['fmp_time']: fmpTime
        }

        // 数据上报
        const cb = this.global.trackHandlers.perPageLoad;
        if (cb) {
          cb(performanceData);
        }
        return;
      }

      // 如果没有获取到，则继续获取
      this.performanceLoadTrack();
    }, 500)
  }
}

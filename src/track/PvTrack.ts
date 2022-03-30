import { BaseTrack } from './BaseTrack';
import { PageWatcher } from '../utils/PageWatcher';
import { SpiderGlobal } from '../utils/SpiderGlobal';
import { PageEventType } from '../interface';

export class PvTrack extends BaseTrack {
  private ptUrls: Set<string> = new Set(); // 缓存需要上报页面的url

  constructor(private global: SpiderGlobal, private pageWatcher: PageWatcher) {
    super(global);

    this.pageWatcher.on(PageEventType.visitStart, (arg) => {
      const cb = this.global.trackHandlers.pv;
      if (cb) {
        cb(arg)
      }
    });
    this.pageWatcher.on(PageEventType.visitEnd, (arg) => {
      if (this.needToCollectPageStayDuration()) {
        const cb = this.global.trackHandlers.pageStay;
        if (cb) {
          cb({
            currentUrl: arg.currentUrl,
            referrerUrl: arg.referrerUrl,
            stayDuration: arg.stayDuration ? arg.stayDuration : 0
          });
        }
      }
    });
  }

  init(): void {
    this.pageWatcher.init();
  }

  private getCurrentUrlFullPath() {
    return location.origin + location.pathname;
  }

  private needToCollectPageStayDuration(): boolean {
    if (this.global.collectAllPageStayDuration) {
      return true;
    } else {
      return this.ptUrls.has(this.getCurrentUrlFullPath());
    }
  }

  // 上报页面停留时长开关
  public reportPageStay() {
    this.ptUrls.add(this.getCurrentUrlFullPath());
  }
}

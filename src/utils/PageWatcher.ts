import hack from './hackHistory';
import { EventUtils } from './utils';
import { SingleTimer } from './SingleTimer';
import { SpiderConsole } from './Console';
import { PageEventType, PageEventHandler, PageEventArgs } from '../interface';
import { SpiderGlobal } from './SpiderGlobal';

export class PageWatcher extends SpiderConsole {
  private _handlers = new Map<PageEventType, PageEventHandler[]>();

  // 当前页面URL
  private _currentUrl = location.href;
  // 前导页面URL
  private _referrerUrl = document.referrer;
  // 当前页面停留时长
  private _stayDuration: number = 0;

  private _timer: SingleTimer;
  private _intervalId?: string;
  private _startTs: number = 0;
  private _duration: number = 0;

  private _currentPageIsShow: boolean = false;
  private get currentPageIsShow(): boolean {
    return this._currentPageIsShow;
  }
  private set currentPageIsShow(v: boolean) {
    // 判断页面曝光状态的变化，触发对应的事件
    if (this._currentPageIsShow !== v) {
      if (v) {
        // hide => show
        this._startTs = (new Date()).getTime();
        this._intervalId = this._timer.setInterval(() => {
          this._duration = (new Date()).getTime() - this._startTs;
          // 如果是心跳模式
          if (this.global.heartbeatMode) {
            this.emit(PageEventType.visitEnd, {
              currentUrl: this._currentUrl,
              referrerUrl: this._referrerUrl,
              stayDuration: this._stayDuration + this._duration
            });
          }
        }, 5000);
        this.emit(PageEventType.show, {
          currentUrl: this._currentUrl,
          referrerUrl: this._referrerUrl
        });
      } else {
        // show => hide
        // TODO:如果转为隐藏状态，需要上报停留时长吗？
        // 将时间累计到当前页面总的停留时长上
        this._duration = (new Date()).getTime() - this._startTs;
        this._stayDuration += this._duration;
        // 重置计时逻辑
        this._duration = 0;
        this._startTs = 0;
        if (this._intervalId) {
          this._timer.clearInterval(this._intervalId);
          this._intervalId = undefined;
        }
        this.emit(PageEventType.hide, {
          currentUrl: this._currentUrl,
          referrerUrl: this._referrerUrl
        });
      }
    }
    this._currentPageIsShow = v;
  }

  private lastTs: number = 0;
  private _isInited = false;

  constructor(private global: SpiderGlobal) {
    super(global, 'pageWatcher');
    this._timer = new SingleTimer(global, 1000);

    this._handlers.set(PageEventType.visitStart, []);
    this._handlers.set(PageEventType.show, []);
    this._handlers.set(PageEventType.hide, []);
    // hack历史栈的操作
    hack();
  }

  init() {
    if (this._isInited) {
      return;
    }
    this._isInited = true;
    this.lastTs = (new Date()).getTime();
    this.emit(PageEventType.visitStart, {
      currentUrl: this._currentUrl,
      referrerUrl: this._referrerUrl
    });
    // 绑定监听页面的一系列事件
    EventUtils.addHandler(window, 'pushState', this.handleRouteChanged.bind(this));
    EventUtils.addHandler(window, 'replaceState', this.handleRouteChanged.bind(this));
    EventUtils.addHandler(window, 'popstate', this.handleRouteChanged.bind(this));
    EventUtils.addHandler(window, 'hashchange', () => {
      if (!window.history.pushState) {
        this.handleRouteChanged()
      }
    });
    EventUtils.addHandler(window, 'beforeunload', this.handlePageUnload.bind(this));
    EventUtils.addHandler(document, 'visibilitychange', this.handleVisibilityState.bind(this));
    EventUtils.addHandler(window, 'pageshow', this.handlePageShow.bind(this));
    EventUtils.addHandler(window, 'pagehide', this.handlePageHide.bind(this));
  }

  on(eventType: PageEventType, fn: PageEventHandler) {
    let handlers = this._handlers.get(eventType);
    if (!handlers) {
      handlers = [];
      this._handlers.set(eventType, handlers);
    }
    handlers.push(fn);
  }

  private emit(eventType: PageEventType, arg: PageEventArgs) {
    try {
      this.log('触发事件:', PageEventType[eventType], 'current:', arg.currentUrl, 'referrer:', arg.referrerUrl, 'duration:', arg.stayDuration);
      const handlers = this._handlers.get(eventType);
      if (handlers) {
        for (let handler of handlers) {
          handler.call(window, arg);
        }
      }
    } catch (e) {
      this.log(e);
    }
  }

  private getPageShowStatus(): boolean {
    if (document.hidden === undefined) {
      return true;
    } else {
      return !document.hidden;
    }
  }

  private isDuplicated() {
    const newTs = (new Date()).getTime();
    const newCurrentUrl = location.href;
    if (newCurrentUrl === this._currentUrl && newTs - this.lastTs < 1000) {
      return true;
    } else {
      return false;
    }
  }

  private changeUrl() {
    this._referrerUrl = this._currentUrl;
    this._currentUrl = location.href;
    // 切换了URL之后，页面停留时长需要重新计时
    this._stayDuration = 0;
  }

  private handleRouteChanged() {
    this.log('执行路由变更事件');
    if (this.isDuplicated()) {
      this.log('url重复，不再执行路由变更事件处理');
      return;
    }
    this.currentPageIsShow = false;
    this.emit(PageEventType.visitEnd, {
      currentUrl: this._currentUrl,
      referrerUrl: this._referrerUrl,
      stayDuration: this._stayDuration
    });
    this.changeUrl();
    this.emit(PageEventType.visitStart, {
      currentUrl: this._currentUrl,
      referrerUrl: this._referrerUrl
    });
    this.currentPageIsShow = this.getPageShowStatus();
  }

  private handlePageUnload() {
    this.log('执行页面卸载事件');
    this.currentPageIsShow = false;
    this.emit(PageEventType.visitEnd, {
      currentUrl: this._currentUrl,
      referrerUrl: this._referrerUrl,
      stayDuration: this._stayDuration
    });
  }

  private handlePageShow() {
    this.log('执行pageshow事件');
    this.currentPageIsShow = true;
  }

  private handlePageHide() {
    this.log('执行pagehide事件');
    this.currentPageIsShow = false;
  }

  private handleVisibilityState() {
    this.log('执行visibilityChanged事件');
    this.currentPageIsShow = !document.hidden;
  }
}

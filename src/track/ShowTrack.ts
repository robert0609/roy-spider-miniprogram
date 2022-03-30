import { BaseTrack } from './BaseTrack';
import { DomStyleUtils } from '../utils/utils';
import { IShowAreaTimeParams } from '../interface'
import { SingleTimer } from '../utils/SingleTimer';
import { PageWatcher } from '../utils/PageWatcher';
import { PageEventType } from '../interface';
import { SpiderConsole } from '../utils/Console';
import { SpiderGlobal } from '../utils/SpiderGlobal';

class ShowCollector extends SpiderConsole {
  private _showName: string;
  private _elementSelector: string;
  // private parentElementSelector?: string; // TODO: 暂时先不考虑元素嵌套滚动场景
  private _percent: number = 20;

  // 曝光时长是定时检测机制，此变量保存上一次检测的曝光状态
  private _lastShowStatus: boolean = false;
  private _lastTimestamp: number = 0;
  private _duration: number = 0;

  private _pause: boolean = false;

  get showName(): string {
    return this._showName;
  }

  constructor(params: IShowAreaTimeParams, private global: SpiderGlobal) {
    super(global, 'showCollector');

    this._showName = params.showName;
    this._elementSelector = params.elementSelector;
    // this.parentElementSelector = params.parentElementSelector; // TODO: 暂时先不考虑元素嵌套滚动场景
    this._percent = params.percent || 20;
  }

  pause() {
    if (this._pause) {
      return;
    }
    this._pause = true;
    // 如果上一次曝光状态是显示的话，则将到目前为止的时长上报
    if (this._lastShowStatus) {
      this.end();
    }
  }

  resume() {
    if (!this._pause) {
      return;
    }
    // 能走到这步，说明上一次曝光状态是隐藏，需要判断当前曝光状态，来决定是否开启曝光采集
    const currentShowStatus = this.getCurrentShowStatus();
    if (currentShowStatus) {
      this.start();
    }
    this._pause = false;
  }

  calc() {
    if (this._pause) {
      return;
    }
    const currentTimestamp = (new Date()).getTime();
    const currentShowStatus = this.getCurrentShowStatus();

    if (this._lastShowStatus) {
      if (currentShowStatus) {
        // 如果之前是曝光状态，现在也是曝光状态，则累计时间
        this._duration += currentTimestamp - this._lastTimestamp;
        this._lastTimestamp = currentTimestamp;
        this.log('模块累计曝光', this._showName);
        // 如果是心跳模式
        if (this.global.heartbeatMode) {
          // 上报数据
          this.report();
        }
      } else {
        // 如果之前是曝光状态，现在不是了，则需要将当前阶段累计时间上报，并且重置状态，准备下一次进入曝光的时间计算
        this.end(currentTimestamp);
      }
    } else {
      if (currentShowStatus) {
        // 如果之前不是曝光状态，现在是曝光状态了，则需要开始累计时间
        this.start(currentTimestamp);
      } else {
        // 如果之前不是曝光状态，现在也不是，则无需处理
      }
    }
  }

  private start(currentTimestamp?: number) {
    if (!currentTimestamp) {
      currentTimestamp = (new Date()).getTime();
    }
    this._lastTimestamp = currentTimestamp;
    this._lastShowStatus = true;
    this._duration = 0;
    this.log('模块开始曝光', this._showName);
    // 上报进入曝光状态事件
    this.reportEnterViewport();
  }

  private end(currentTimestamp?: number) {
    if (!currentTimestamp) {
      currentTimestamp = (new Date()).getTime();
    }
    this._duration += currentTimestamp - this._lastTimestamp;
    this._lastTimestamp = 0;
    this._lastShowStatus = false;
    this.log('模块结束曝光', this._showName);
    // 上报数据
    this.report();
  }

  private getCurrentShowStatus(): boolean {
    let currentShowStatus = false;
    const element = document.querySelector(this._elementSelector);
    if (element) {
      currentShowStatus = this.calculateArea(element, this._percent);
    } else {
      // 如果没有获取到元素，认为是没有曝光的状态
      currentShowStatus = false;
    }
    return currentShowStatus;
  }

  // 计算曝光面积，是否处于曝光状态
  private calculateArea(el: Element, percent: number): boolean {
    let { clientWidth, clientHeight } = DomStyleUtils.getDomStyle();
    let { width, height, top, bottom, left, right } = el.getBoundingClientRect();

    // 进入可视区域宽高
    let showAreaHeight = Math.min(clientHeight - top, bottom, height, clientHeight);;
    let showAreaWidth = Math.min(clientWidth - left, right, width, clientWidth);

    let showArea = showAreaHeight * showAreaWidth; // 进入可视区域面积
    let elementArea = width * height; // 指定元素面积
    if (elementArea <= 0) {
      return false;
    } else {
      return showArea >= elementArea * percent / 100;
    }
  }

  private reportEnterViewport() {
    const cb = this.global.trackHandlers.elementEnterViewport;
    if (cb) {
      cb({
        showName: this._showName,
        duration: this._duration
      });
    }
  }

  private report() {
    const cb = this.global.trackHandlers.elementShow;
    if (cb) {
      cb({
        showName: this._showName,
        duration: this._duration
      });
    }
  }
}

export class ShowTrack extends BaseTrack {
  private timer: SingleTimer;
  private loopId?: string;
  private collectors: ShowCollector[] = [];

  constructor(private global: SpiderGlobal, private pageWatcher: PageWatcher) {
    super(global, 'showTrack');
    this.timer = new SingleTimer(global, 1000);

    this.pageWatcher.on(PageEventType.show, () => {
      this.start();
    });
    this.pageWatcher.on(PageEventType.hide, () => {
      this.stop();
    });
    this.pageWatcher.on(PageEventType.visitStart, () => {
      this.collectors = [];
    });
  }

  init(): void {
    this.pageWatcher.init();
  }

  reportShowElements(params: IShowAreaTimeParams[]) {
    setTimeout(() => {
      params.forEach(item => {
        const sameCollectors = this.collectors.filter(c => c.showName === item.showName);
        if (sameCollectors.length > 0) {
          sameCollectors[0].resume();
        } else {
          this.collectors.push(new ShowCollector(item, this.global));
        }
      });
      this.start();
    }, 0);
  }

  pause(showNames?: string[]) {
    if (showNames) {
      this.collectors.filter(c => showNames.includes(c.showName)).forEach(c => {
        c.pause();
      });
    } else {
      this.collectors.forEach(c => {
        c.pause();
      });
    }
  }

  resume() {
    this.collectors.forEach(c => {
      c.resume();
    });
  }

  private start() {
    if (this.collectors.length > 0 && !this.loopId) {
      // 插入定时器处理
      this.loopId = this.timer.setInterval(() => {
        this.log('正在监听页面上的曝光模块');
        this.collectors.forEach(collector => {
          collector.calc();
        });
      }, 3000);
      this.log('开始监听页面上的曝光模块', this.loopId);
    }
  }

  private stop() {
    if (this.loopId) {
      this.collectors.forEach(collector => {
        collector.calc();
      });
      this.log('结束监听页面上的曝光模块', this.loopId);
      this.timer.clearInterval(this.loopId);
      this.loopId = undefined;
    }
  }
}

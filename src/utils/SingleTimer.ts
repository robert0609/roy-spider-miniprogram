import { uuid } from './utils';
import { SpiderConsole } from './Console';
import { SpiderGlobal } from './SpiderGlobal';

export type loopCallback = (this: SingleTimer) => void;

export interface ILoopInfo {
  callback: loopCallback;
  lastTime: number;
  interval: number;
}

export class SingleTimer extends SpiderConsole {
  private timerHandle?: number;
  private loopMap: Map<string, ILoopInfo>;
  private looping: boolean = false;

  constructor (global: SpiderGlobal, private timerInterval: number = 500) {
    super(global);

    this.loopMap = new Map();
  }

  private loop(fn: loopCallback) {
    fn.call(this);
    this.timerHandle = window.setTimeout(() => {
      this.loop(fn);
    }, this.timerInterval);
  }

  private start() {
    if (this.looping) {
      return;
    }
    if (this.loopMap.size > 0) {
      this.looping = true;
      this.loop(() => {
        const ct = (new Date()).getTime();
        for (let loopInfo of this.loopMap.values()) {
          const lt = loopInfo.lastTime;
          if (ct - lt >= loopInfo.interval) {
            // 如果间隔时间够了，则执行定时回调
            loopInfo.callback.call(this);
            loopInfo.lastTime = (new Date()).getTime();
          }
        }
      });
    }
  }

  private stop() {
    if (!this.looping) {
      return;
    }
    if (this.loopMap.size === 0) {
      try {
        window.clearTimeout(this.timerHandle);
        this.looping = false;
      } catch (e) {
        this.log(e);
      }
    }
  }

  setInterval(fn: loopCallback, interval: number = 0): string {
    let id = uuid();
    this.loopMap.set(id, {
      callback: fn,
      lastTime: (new Date()).getTime(),
      interval
    });
    // 惰性开始：start内部判断如果至少设置了一个回调，就开始计时器
    this.start();

    return id;
  }

  clearInterval(intervalId: string) {
    if (this.loopMap.has(intervalId)) {
      this.loopMap.delete(intervalId);
    }
    // 惰性结束：stop内部判断如果没有回调了，才停止计时器
    this.stop();
  }
}

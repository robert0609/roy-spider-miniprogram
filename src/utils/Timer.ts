import { uuid } from './utils';

export type loopCallback = (this: Timer) => void;

export class Timer {
  private loopMap: Map<string, number>;

  constructor () {
    this.loopMap = new Map();
  }

  private loop(loopId: string, fn: loopCallback, interval: number = 0) {
    fn.call(this);
    const handle = window.setTimeout(() => {
      this.loop(loopId, fn, interval);
    }, interval);
    // 缓存住计时器句柄
    this.loopMap.set(loopId, handle);
  }

  setInterval(fn: loopCallback, interval: number = 0): string {
    const id = uuid();
    this.loop(id, fn, interval);
    return id;
  }

  clearInterval(intervalId: string) {
    if (this.loopMap.has(intervalId)) {
      window.clearTimeout(this.loopMap.get(intervalId));
      this.loopMap.delete(intervalId);
    }
  }
}

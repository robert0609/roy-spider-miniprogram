import { SpiderConsole } from "../utils/Console";
import { SpiderGlobal } from "../utils/SpiderGlobal";

export abstract class BaseTrack extends SpiderConsole {
  constructor(global: SpiderGlobal, context?: string) {
    super(global, context);
  }

  abstract init(): void; // 指标采集跟踪器都需要实现此接口，以便对外是统一的接口约定
}

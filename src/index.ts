import { SpiderGlobal } from './utils/SpiderGlobal';
import { Track } from './track';
import { IShowAreaTimeParams, IGlobalOptions } from './interface';
import { RequestWatcher } from './utils/RequestWatcher';
import { PageWatcher } from './utils/PageWatcher';

export * from './interface';
export * from './interface/Track';
export {
  RequestWatcher
};

export default class Spider {
  private track: Track;
  requestWatcher: RequestWatcher;

  constructor(options?: IGlobalOptions) {
    const global = new SpiderGlobal();
    global.init(options);
    const pageWatcher = new PageWatcher(global);
    this.requestWatcher = new RequestWatcher(global);
    this.track = new Track(global, pageWatcher, this.requestWatcher)
    this.track.init();
  }

  reportPageStay() {
    this.track.reportPageStay();
  }

  reportShowElements(params: IShowAreaTimeParams[]) {
    this.track.reportShowElements(params);
  }

  pauseReportShowElements(showNames?: string[]) {
    this.track.pauseReportShowElements(showNames);
  }

  resumeReportShowElements() {
    this.track.resumeReportShowElements();
  }
}

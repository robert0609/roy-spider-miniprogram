import { BaseTrack } from './BaseTrack';
import { PvTrack } from './PvTrack';
import { ClickTrack } from './ClickTrack';
import { ShowTrack } from './ShowTrack';
import { PerApiTrack } from './PerApiTrack';
import { PerLoadTrack } from './PerLoadTrack';
import { IShowAreaTimeParams } from '../interface';
import { SpiderGlobal } from '../utils/SpiderGlobal';
import { PageWatcher } from '../utils/PageWatcher';
import { RequestWatcher } from '../utils/RequestWatcher';

export class Track {
  private readonly _trackList: BaseTrack[];
  private readonly _pvTrack: PvTrack;
  private readonly _showTrack: ShowTrack;

  constructor(global: SpiderGlobal, pageWatcher: PageWatcher, requestWatcher: RequestWatcher) {
    this._pvTrack = new PvTrack(global, pageWatcher);
    this._showTrack = new ShowTrack(global, pageWatcher);
    this._trackList = [
      this._pvTrack,
      new ClickTrack(global),
      this._showTrack,
      new PerApiTrack(global, requestWatcher),
      new PerLoadTrack(global)
    ];
  }

  init() {
    this._trackList.forEach(t => {
      t.init();
    });
  }

  reportPageStay() {
    this._pvTrack.reportPageStay();
  }

  reportShowElements(params: IShowAreaTimeParams[]) {
    this._showTrack.reportShowElements(params);
  }

  pauseReportShowElements(showNames?: string[]) {
    this._showTrack.pause(showNames);
  }

  resumeReportShowElements() {
    this._showTrack.resume();
  }
}

import { IGlobalOptions, TrackHandlers } from "../interface";

export class SpiderGlobal {
  private _showLog: boolean;
  private _collectAllPageStayDuration: boolean;
  private _heartbeatMode: boolean;
  private _whiteApiUrls: string[];
  private _requestTrackIdKey: string;
  trackHandlers: TrackHandlers;

  constructor() {
    this._showLog = false;
    this._collectAllPageStayDuration = false;
    this._heartbeatMode = false;
    this._whiteApiUrls = [];
    this._requestTrackIdKey = 'x-trace-id';
    this.trackHandlers = {};
  }

  get showLog(): boolean {
    return this._showLog;
  }

  get collectAllPageStayDuration(): boolean {
    return this._collectAllPageStayDuration;
  }

  get heartbeatMode(): boolean {
    return this._heartbeatMode;
  }

  get whiteApiUrls(): string[] {
    return this._whiteApiUrls;
  }

  get requestTrackIdKey(): string {
    return this._requestTrackIdKey;
  }

  init(options?: IGlobalOptions) {
    if (options) {
      if (options.showLog !== undefined) {
        this._showLog = options.showLog;
      }
      if (options.collectAllPageStayDuration !== undefined) {
        this._collectAllPageStayDuration = options.collectAllPageStayDuration;
      }
      if (options.heartbeatMode !== undefined) {
        this._heartbeatMode = options.heartbeatMode;
      }
      if (options.whiteApiUrls !== undefined) {
        this._whiteApiUrls = options.whiteApiUrls;
      }
      if (options.trackHandlers) {
        this.trackHandlers = options.trackHandlers;
      }
      if (!!options.requestTrackIdKey) {
        this._requestTrackIdKey = options.requestTrackIdKey;
      }
    }
  }
}

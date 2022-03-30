import { IRequestTrace } from "./index";

export type TrackEvent = 'launch' | 'pageView' | 'elementClick' | 'perApi' | 'perPageLoad';

export type LaunchArgs = {
  currentUrl: string;
};

export type PageViewArgs = {
  currentUrl: string;
  referrerUrl: string;
};

export type ElementClickArgs = {
  actionName: string;
  actionArgs?: any;
  event: MouseEvent;
};

export type PerApiArgs = {
  url: string;
  trace: IRequestTrace;
  totalDuration: number;
  redirectDuration?: number;
  dnsDuration?: number;
  connectDuration?: number;
  requestDuration?: number;
  responseDuration?: number;
  rawPerformance?: PerformanceResourceTiming;
};

export type PerPageLoadArgs = {
  connectDuration: number;
  dnsDuration: number;
  loadingDuration: number;
  whiteScreenDuration: number;
  requestDuration: number;
  domParseDuration: number;
  domReadyDuration: number;
  docDuration: number;
  fmpDuration?: number;
  rawPerformance?: PerformanceTiming;
};

export type TrackEventHandler<T extends (LaunchArgs | PageViewArgs | ElementClickArgs | PerApiArgs | PerPageLoadArgs)> = (arg: T) => void;

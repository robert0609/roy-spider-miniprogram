import { IRequestTrace } from "./index";

export type TrackEvent = 'pv' | 'pageStay' | 'elementShow' | 'click' | 'perApi' | 'perPageLoad';

export type PVArgs = {
  currentUrl: string;
  referrerUrl: string;
};

export type PageStayArgs = {
  currentUrl: string;
  referrerUrl: string;
  stayDuration: number;
};

export type ElementShowArgs = {
  showName: string;
  duration: number;
}

export type ClickArgs = {
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

export type TrackEventHandler<T extends (PVArgs | PageStayArgs | ElementShowArgs | ClickArgs | PerApiArgs | PerPageLoadArgs)> = (arg: T) => void;

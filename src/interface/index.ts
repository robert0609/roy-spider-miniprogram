import { TrackEventHandler, PVArgs, PageStayArgs, ElementShowArgs, ClickArgs, PerApiArgs, PerPageLoadArgs } from "./Track";

/**
 * 请求监听相关的类型
 */

export enum InterceptorType {
  beforeSendRequest,
  afterRecieveResponse
}

export interface IRequestTrace {
  method: string;
  url: string;
  body?: Document | BodyInit | null;
  headers?: {
    [key: string]: string | number
  };
  response?: any;
  status?: number;
  statusText?: string;
  readonly useFetch: boolean;
  error?: Error;
}

export type InterceptorFunctionType = (this: Window, trace: IRequestTrace) => IRequestTrace;

/**
 * 页面操作监听器相关的类型
 */

export enum PageEventType {
  visitStart,
  visitEnd,
  show,
  hide
}

export type PageEventArgs = {
  currentUrl: string;
  referrerUrl: string;
  stayDuration?: number;
};

export type PageEventHandler = (this: Window, arg: PageEventArgs) => void;


export interface IShowAreaTimeParams {
  showName: string;
  elementSelector: string;
  percent?: number;
}

export type TrackHandlers = {
  ['pv']?: TrackEventHandler<PVArgs>;
  ['pageStay']?: TrackEventHandler<PageStayArgs>;
  ['elementEnterViewport']?: TrackEventHandler<ElementShowArgs>;
  ['elementShow']?: TrackEventHandler<ElementShowArgs>;
  ['click']?: TrackEventHandler<ClickArgs>;
  ['perApi']?: TrackEventHandler<PerApiArgs>;
  ['perPageLoad']?: TrackEventHandler<PerPageLoadArgs>;
};

export interface IGlobalOptions {
  /**
   * 是否在控制台输出日志
   */
  showLog?: boolean;
  /**
   * 是否自动采集所有页面的停留时长
   */
  collectAllPageStayDuration?: boolean;
  /**
   * 页面停留时长和区域曝光时长采集的模式是否是心跳模式
   */
  heartbeatMode?: boolean;
  /**
   * 接口白名单，在此白名单内的接口地址，不会进行拦截
   */
  whiteApiUrls?: string[];
  /**
   * 采集器的上报处理钩子
   */
  trackHandlers?: TrackHandlers;
  /**
   * 监控请求的traceId的header名称
   */
  requestTrackIdKey: string;
};

import { SpiderConsole } from './Console';
import { singleHack } from './hack';
import { InterceptorFunctionType, IRequestTrace } from '../interface';

export function addBeforeInterceptor(interceptor: InterceptorFunctionType) {
  window.__ajaxInterceptors = window.__ajaxInterceptors || {};
  const wai = window.__ajaxInterceptors;
  wai['beforeSendRequest'] = wai['beforeSendRequest'] || [];
  if (interceptor) {
    wai['beforeSendRequest'].push(interceptor);
  }
}

export function addAfterInterceptor(interceptor: InterceptorFunctionType) {
  window.__ajaxInterceptors = window.__ajaxInterceptors || {};
  const wai = window.__ajaxInterceptors;
  wai['afterRecieveResponse'] = wai['afterRecieveResponse'] || [];
  if (interceptor) {
    wai['afterRecieveResponse'].push(interceptor);
  }
}

function hack() {
  window.__ajaxInterceptors = window.__ajaxInterceptors || {};
  const wai = window.__ajaxInterceptors;

  function traverseInterceptor(interceptors: Function[], trace: IRequestTrace): IRequestTrace {
    try {
      if (interceptors && interceptors.length > 0) {
        for (let intcep of interceptors) {
          trace = intcep.call(window, trace);
        }
      }
      return trace;
    } catch (e) {
      return trace;
    }
  }

  const oldFetch = window.fetch;
  if (oldFetch) {
    singleHack(window, 'window', 'fetch', function (input: RequestInfo, init?: RequestInit): Promise<Response> {
      let trace: IRequestTrace = {
        useFetch: true,
        method: 'get',
        url: ''
      };
      if (typeof input === 'string') {
        trace.url = input;
        if (init) {
          if (init.method) {
            trace.method = init.method;
          }
          trace.body = init.body;
        }
      } else {
        trace.url = input.url;
        trace.method = input.method;
        trace.body = input.body;
      }
      try {
        // hack处理
        if (wai['beforeSendRequest']) {
          trace = traverseInterceptor(wai['beforeSendRequest'], trace);
          // 设置header
          if (trace.headers) {
            if (typeof input !== 'string') {
              for (let name in trace.headers) {
                input.headers.append(name, trace.headers[name].toString());
              }
            }
            if (!init) {
              init = {};
            }
            if (!init.headers) {
              init.headers = {};
            }
            let t: {
              [k: string]: string;
            } = {};
            for (let name in trace.headers) {
              t[name] = trace.headers[name].toString();
            }
            init.headers = {...init.headers, ...t};
          }
        }
      } catch (e) {
        SpiderConsole.log(e);
      }
      return oldFetch.call(window, input, init).then((response) => {
        try {
          trace.response = response.body;
          trace.status = response.status;
          trace.statusText = response.statusText;
          if (wai['afterRecieveResponse']) {
            traverseInterceptor(wai['afterRecieveResponse'], trace);
          }
        } catch (e) {
          SpiderConsole.log(e);
        }
        return response;
      }).catch((error) => {
        try {
          trace.response = '';
          trace.status = 0;
          trace.statusText = '';
          if (wai['afterRecieveResponse']) {
            traverseInterceptor(wai['afterRecieveResponse'], trace);
          }
        } catch (e) {
          SpiderConsole.log(e);
        }
        throw error;
      });
    });
  }

  const oldOpen = XMLHttpRequest.prototype.open;
  const oldSend = XMLHttpRequest.prototype.send;
  singleHack(XMLHttpRequest.prototype, 'XMLHttpRequest.prototype', 'open', function (this: XMLHttpRequest, method: string, url: string, async?: boolean, username?: string | null, password?: string | null) {
    if (async === undefined) {
      async = true;
    }
    try {
      // hack处理
      this.trace = {
        useFetch: false,
        method,
        url
      };
    } finally {
      oldOpen.call(this, method, url, async, username, password);
    }
  });
  singleHack(XMLHttpRequest.prototype, 'XMLHttpRequest.prototype', 'send', function (this: XMLHttpRequest, body?: Document | BodyInit | null) {
    function handleResponse(this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) {
      if (wai['afterRecieveResponse']) {
        traverseInterceptor(wai['afterRecieveResponse'], {
          ...this.trace,
          response: this.response,
          status: this.status,
          statusText: this.statusText
        });
      }
    }

    try {
      // hack处理
      this.trace.body = body;
      if (wai['beforeSendRequest']) {
        this.trace = traverseInterceptor(wai['beforeSendRequest'], this.trace);
        // 设置header
        if (this.trace.headers) {
          for (let name in this.trace.headers) {
            this.setRequestHeader(name, this.trace.headers[name].toString());
          }
        }
      }
      // 绑定事件处理
      this.addEventListener('load', handleResponse);
      this.addEventListener('error', handleResponse);
    } finally {
      try {
        oldSend.call(this, body);
      } catch (e) {
        SpiderConsole.log('error', e);
        this.trace.error = e;
      }
    }
  });
  // TODO: hack xmlHttpRequest.addEventListener;关于XMLHttpRequest response的hack暂时没有做到拦截器流机制，目前只是接收通知
  // const oldAddEventListener = XMLHttpRequest.prototype.addEventListener;
  // XMLHttpRequest.prototype.addEventListener = function <K extends keyof XMLHttpRequestEventMap>(this: XMLHttpRequest, type: K, listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {

  // };
}

export default hack;

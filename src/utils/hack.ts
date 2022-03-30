import { SpiderConsole } from './Console';

const wrapperFlag = '__SPIDER_HACK__';

export interface IWrapperFunction extends Function {
  [wrapperFlag]?: boolean;
}

export function singleHack(target: any, targetName: string, fnName: string, wrapperFn: IWrapperFunction) {
  const originalFn = target[fnName];
  const fullFnName = `${targetName}.${fnName}`;
  if (typeof originalFn !== 'function') {
    throw new Error(`${fullFnName}不是函数，无法hack`);
  }
  const fn = originalFn as IWrapperFunction;
  if (fn[wrapperFlag] === true) {
    // 已经hack过了，无需再次hack
    SpiderConsole.log(`${fullFnName}已经hack过了，无需再次hack`);
    return;
  }
  // 设置包装标记
  wrapperFn[wrapperFlag] = true;
  target[fnName] = wrapperFn;
  SpiderConsole.log(`${fullFnName}已经hack完成`);
}

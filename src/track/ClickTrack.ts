import { BaseTrack } from './BaseTrack';
import { EventUtils, DomAttrUtils } from '../utils/utils';
import { SpiderGlobal } from '../utils/SpiderGlobal';

function getElementWithActionName(el: HTMLElement): { actionName: string; actionArgs?: any } | null {
  if (!el.dataset) {
    return null;
  }
  if (el.dataset.actionName) {
    if (el.dataset.actionArgs) {
      return {
        actionName: el.dataset.actionName,
        actionArgs: el.dataset.actionArgs
      };
    } else {
      return {
        actionName: el.dataset.actionName
      };
    }
  } else {
    // let r: HTMLElement | null;
    let parent = el.parentElement;
    while (parent && !parent.dataset.actionName) {
      parent = parent.parentElement;
    }

    if (parent && parent.dataset.actionName) {
      el.dataset.actionName = parent.dataset.actionName;
      if (parent.dataset.actionArgs) {
        el.dataset.actionArgs = parent.dataset.actionArgs;
      }
      if (el.dataset.actionArgs) {
        return {
          actionName: el.dataset.actionName,
          actionArgs: el.dataset.actionArgs
        };
      } else {
        return {
          actionName: el.dataset.actionName
        };
      }
    } else {
      return null;
    }
  }
}

export class ClickTrack extends BaseTrack {
  constructor(private global: SpiderGlobal) {
    super(global);
  }

  init(): void {
    EventUtils.addHandler(document, 'click', (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        const actionParams = getElementWithActionName(event.target);
        if (actionParams && actionParams.actionName) {
          const cb = this.global.trackHandlers.click;
          if (cb) {
            cb({ ...actionParams, event });
          }
        } else if (event.target.dataset && event.target.dataset.logCollect === 'true') {
          let properties = event.target.dataset.sa ? DomAttrUtils.dataSet(event.target, 'sa') : {};
          const cb = this.global.trackHandlers.click;
          if (cb) {
            cb({
              actionName: 'log-collect',
              actionArgs: properties,
              event
            });
          }
        } else if (event.target && event.target.getAttribute('sa-collect') === 'true') {
          let properties = event.target.dataset.sa ? DomAttrUtils.dataSet(event.target, 'sa') : {};
          const cb = this.global.trackHandlers.click;
          if (cb) {
            cb({
              actionName: 'sa-collect',
              actionArgs: properties,
              event
            });
          }
        }
      }
    })
  }
}

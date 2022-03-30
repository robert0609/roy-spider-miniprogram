import { singleHack } from './hack';

function hack() {
  let _wr = function (type: 'pushState' | 'replaceState') {
    let orig = window.history[type];
    singleHack(window.history, 'window.history', type, function (this: History, data: any, title: string, url?: string | null) {
      let rv = orig.call(this, data, title, url);
      let e = new Event(type);
      window.dispatchEvent(e);
      return rv;
    });
  };

  _wr('pushState')
  _wr('replaceState')
}

export default hack;

// 事件实体类
export class EventUtils {
  static addHandler(element: any, type: string, handler: Function): void {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false)
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler)
    } else {
      element["on" + type] = handler
    }
  }
  static removeHandler(element: any, type: string, handler: Function): void {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false)
    } else if (element.detachEvent){
      element.detachEvent("on" + type, handler)
    } else {
      element["on" + type] = null
    }
  }
  static getEvent(event: any) {
    return event ? event : window.event
  }
  static getTarget(event: any) {
    return event.target || event.srcElement
  }
  static preventDefault(event: any) {
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }
  static stopPropagation(event: any) {
    if (event.stopPropagation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
  }
}

// DOM属性相关
export class DomAttrUtils {
  public static dataSet(target: any, attr: string): Object {
    let attribute = target.dataset[attr]
    if (attribute) {
      let arr = attribute.split(',')
      let map = new Map()
      let properties = Object.create(null)
      arr.forEach((element: any) => {
        let k:string = element.split(':')[0]
        map.set(k, element.split(':')[1])
      });
      map.forEach((value, key) => {
        properties[key] = value.trim()
      })
      return properties
    } else {
      return {}
    }
  }
}

// dom样式实体类
export class DomStyleUtils {
  public static getDomStyle(element?: HTMLElement | null, scrollTopElement?: HTMLElement | null, scrollLeftElement?: HTMLElement | null) {
    return {
      scrollTop: scrollTopElement ? DomStyleUtils.scrollTop(scrollTopElement) : DomStyleUtils.scrollTop(),
      scrollLeft: scrollLeftElement ? DomStyleUtils.scrollLeft(scrollLeftElement) : DomStyleUtils.scrollLeft(),
      clientWidth: DomStyleUtils.clientWidth(),
      clientHeight: DomStyleUtils.clientHeight(),
      elementWidth: element ? DomStyleUtils.elementWidth(element) : 0,
      elementHeight: element ? DomStyleUtils.elementHeight(element) : 0,
      elementLeft: element ? DomStyleUtils.elementLeft(element, scrollLeftElement) : 0,
      elementTop: element ? DomStyleUtils.elementTop(element, scrollTopElement) : 0,
      elementViewLeft: element ? DomStyleUtils.elementViewLeft(element, scrollLeftElement) : 0,
      elementViewTop: element ? DomStyleUtils.elementViewTop(element, scrollTopElement) : 0,
    }
  }

  public static scrollTop(parent: HTMLElement | null = null) {
    if (parent !== null) {
      return parent.scrollTop;
    } else {
      return document.documentElement.scrollTop || document.body.scrollTop;
    }
  }

  public static scrollLeft(parent: HTMLElement | null = null) {
    if (parent !== null) {
      return parent.scrollLeft;
    } else {
      return document.documentElement.scrollLeft || document.body.scrollLeft;
    }
  }

  public static clientWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth
  }

  public static clientHeight() {
    return document.documentElement.clientHeight || document.body.clientHeight
  }

  public static elementWidth(element: HTMLElement): number {
    return element.offsetWidth
  }

  public static elementHeight(element: HTMLElement): number {
    return element.offsetHeight
  }

  public static elementLeft(element: HTMLElement, parent: HTMLElement | null = null): number {
    if (parent !== null) {
      if (element === parent) {
        return 0;
      }
    }
    else {
      if (!element.offsetParent) {
        return 0
      }
    }

    return element.offsetLeft + DomStyleUtils.elementLeft(element.offsetParent as HTMLElement, parent)
  }

  public static elementTop(element: HTMLElement, parent: HTMLElement | null = null): number {
    if (parent !== null) {
      if (element === parent) {
        return 0;
      }
    } else {
      if (!element.offsetParent) {
        return 0
      }
    }

    return element.offsetTop + DomStyleUtils.elementTop(element.offsetParent as HTMLElement, parent)
  }

  public static elementViewLeft(element: HTMLElement, parent: HTMLElement | null = null): number {
    return DomStyleUtils.elementLeft(element, parent) - DomStyleUtils.scrollLeft(parent)
  }

  public static elementViewTop(element: HTMLElement, parent: HTMLElement | null = null): number {
    return DomStyleUtils.elementTop(element, parent) - DomStyleUtils.scrollTop(parent)
  }
}

// 生成uuid
export function uuid() {
  let s: any[] = [];
  let hexDigits = '0123456789abcdef';
  for(let i = 0; i < 36; i++) {
    s[i] = s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}

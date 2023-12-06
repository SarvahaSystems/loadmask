export enum MaskSize {
  DEFAULT,
  MINI,
  FIXED_HEIGHT,
}

/**
 * Utility to show/hide loadmask
 */
export class LoadMask {
  static preloaderStack: any = {};
  /**
   * Show a preloader mask on particular element
   * @param maskableEl The HtmlElement we want to mask.
   * @param maskSize Padding around the maskElement
   * @param forceShowMask Forces the mask into view if the loadmask is inside a scrollable section not currently in view
   */
  static showPreloader(
    maskableEl: any,
    maskSize: MaskSize = MaskSize.MINI,
    forceShowMask: boolean = false
  ) {
    debugger;
    if (!maskableEl.maskId) {
      maskableEl.maskId = this.generateUniqueString();
      LoadMask.preloaderStack[maskableEl.maskId] = 0;
      maskableEl.loadMask = this.createMaskEl();
    }
    if (LoadMask.preloaderStack[maskableEl.maskId] == 0) {
      maskableEl.appendChild(maskableEl.loadMask);

      maskableEl.originStyle = {};
      maskableEl.originStyle.position = maskableEl.style.position;
      maskableEl.originStyle.minHeight = maskableEl.style.minHeight;
      maskableEl.originStyle.height = maskableEl.style.height;
      maskableEl.originStyle.display = maskableEl.style.display;
      maskableEl.originStyle.top = maskableEl.style.top;
      maskableEl.originStyle.overflow = maskableEl.style.overflow;

      maskableEl.style.position = "relative";
      maskableEl.style.display = "block";
      maskableEl.style.overflow = "hidden";
      switch (maskSize) {
        case MaskSize.MINI:
          maskableEl.style.minHeight = "75px";

          break;
        case MaskSize.DEFAULT:
          maskableEl.style.minHeight = "200px";
          break;

        case MaskSize.FIXED_HEIGHT:
          maskableEl.style.height = "200px";
      }
    }
    if (forceShowMask) {
      maskableEl.scrollIntoView();
    }
    LoadMask.preloaderStack[maskableEl.maskId]++;
  }
  static hidePreloader(maskableEl: any) {
    if (--LoadMask.preloaderStack[maskableEl.maskId] == 0) {
      // maskableEl.style = {}; - is not recommended, style is readonly property.
      // It throws an exception in IE11 (strict mode) trying to assign value to readonly property,
      // Need to assign value directly to style's property.
      // Example: maskableEl.style.display = some_value

      maskableEl.style.position = maskableEl.originStyle.position;
      maskableEl.style.minHeight = maskableEl.originStyle.minHeight;
      maskableEl.style.height = maskableEl.originStyle.height;
      maskableEl.style.display = maskableEl.originStyle.display;
      maskableEl.style.top = maskableEl.originStyle.top;
      maskableEl.style.overflow = maskableEl.originStyle.overflow;
      delete maskableEl.originStyle;

      maskableEl.removeChild(maskableEl.loadMask);
    }
  }
  private static createMaskEl() {
    const loadMaskWrap = document.createElement("div");
    loadMaskWrap.className = "umsLoadMaskWrap";
    const loadMask = document.createElement("div");
    loadMask.className = "umsLoadMask";
    const bigSqr = document.createElement("div");
    bigSqr.className = "bigSqr";
    const squareFirst = document.createElement("div");
    squareFirst.className = "square first";
    const squareSecond = document.createElement("div");
    squareSecond.className = "square second";
    const squareThird = document.createElement("div");
    squareThird.className = "square third";
    const squareFourth = document.createElement("div");
    squareFourth.className = "square fourth";
    bigSqr.appendChild(squareFirst);
    bigSqr.appendChild(squareSecond);
    bigSqr.appendChild(squareThird);
    bigSqr.appendChild(squareFourth);
    loadMask.appendChild(bigSqr);
    const text = document.createElement("div");
    text.className = "text";
    text.innerHTML = "Loading";
    loadMask.appendChild(text);
    loadMaskWrap.appendChild(loadMask);
    return loadMaskWrap;
  }
  public static generateUniqueString(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let uniqueString = "";

    const firstCharIndex = Math.floor(Math.random() * 52);
    uniqueString += characters.charAt(firstCharIndex);

    for (let i = 1; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueString += characters.charAt(randomIndex);
    }

    return uniqueString;
  }
  public static getSelector(maskEle: any) {
    const type: string = maskEle.tagName.toLowerCase();
    const attributeTobeAdded = LoadMask.generateUniqueString();
    maskEle.setAttribute(attributeTobeAdded, "");
    const selector = `${type}[${attributeTobeAdded}]`;
    return selector;
  }
}

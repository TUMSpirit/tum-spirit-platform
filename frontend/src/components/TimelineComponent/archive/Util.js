class Util {
    static hasClass(el, className) {
      return el.classList ? el.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
  
    static addClass(el, className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i++) {
        if (el.classList) el.classList.add(classes[i]);
        else if (!Util.hasClass(el, classes[i])) el.className += ' ' + classes[i];
      }
    }
  
    static removeClass(el, className) {
      const classes = className.split(' ');
      for (let i = 0; i < classes.length; i++) {
        if (el.classList) el.classList.remove(classes[i]);
        else if (Util.hasClass(el, classes[i])) {
          const reg = new RegExp('(^| )' + classes[i] + '( |$)', 'gi');
          el.className = el.className.replace(reg, ' ');
        }
      }
    }
  
    static toggleClass(el, className, bool) {
      if (bool) Util.addClass(el, className);
      else Util.removeClass(el, className);
    }
  
    static setAttributes(el, attrs) {
      for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    }
  
    static getChildrenByClassName(el, className) {
      const children = el.children;
      return Array.from(children).filter(child => Util.hasClass(child, className));
    }
  
    static is(el, selector) {
      if (selector.nodeType) {
        return el === selector;
      }
  
      const qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector);
      let length = qa.length;
      while (length--) {
        if (qa[length] === el) {
          return true;
        }
      }
  
      return false;
    }
  
    static setHeight(start, to, element, duration, cb) {
      const change = to - start,
            increment = 20;
  
      const animateHeight = (elapsedTime) => {
        elapsedTime += increment;
        const val = Math.easeInOutQuad(elapsedTime, start, change, duration);
        element.style.height = val + 'px';
        if (elapsedTime < duration) {
          setTimeout(() => animateHeight(elapsedTime), increment);
        } else {
          if (cb) cb();
        }
      };
  
      animateHeight(0);
    }
  
    static scrollTo(final, duration, cb) {
      const start = window.scrollY || document.documentElement.scrollTop,
            change = final - start,
            increment = 20;
  
      const animateScroll = (elapsedTime) => {
        elapsedTime += increment;
        const position = Math.easeInOutQuad(elapsedTime, start, change, duration);
        window.scrollTo(0, position);
        if (elapsedTime < duration) {
          setTimeout(() => animateScroll(elapsedTime), increment);
        } else {
          if (cb) cb();
        }
      };
  
      animateScroll(0);
    }
  
    static moveFocus(element) {
      if (!element) element = document.getElementsByTagName("body")[0];
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
  
    static getIndexInArray(array, el) {
      return Array.prototype.indexOf.call(array, el);
    }
  
    static cssSupports(property, value) {
      if ('CSS' in window) {
        return CSS.supports(property, value);
      } else {
        const jsProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return jsProperty in document.body.style;
      }
    }
  }
  
  // Polyfill for Math.easeInOutQuad
  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
  
  export default Util;
  
// 获取最大缩放比例
export function getScale(w1, h1, w2, h2) {
    let sx = w1 / w2;
    let sy = h1 / h2;
    return sx > sy ? sx : sy;
}

// 计算一个点绕原点旋转后的新坐标
export function pointRotate(point, angle) {
    let radian = angleToRadian(angle),
        sin = Math.sin(radian),
        cos = Math.cos(radian);
    return {
        x: cos * point.x - sin * point.y,
        y: cos * point.y + sin * point.x
    };
}

// 角度转弧度
export function angleToRadian(angle) {
    return angle / 180 * Math.PI;
}

// 计算layerTwo上的x、y坐标在layerOne上的坐标
export function loaclToLoacl(layerOne, layerTwo, x, y) {
    x = x || 0;
    y = y || 0;
    let layerOneRect, layerTwoRect;
    hideAction([layerOne, layerTwo], function() {
        layerOneRect = layerOne.getBoundingClientRect();
        layerTwoRect = layerTwo.getBoundingClientRect();
    });
    return {
        x: layerTwoRect.left - layerOneRect.left + x,
        y: layerTwoRect.top - layerOneRect.top + y
    };
}

// 计算相对于窗口的x、y坐标在layer上的坐标
export function globalToLoacl(layer, x, y) {
    x = x || 0;
    y = y || 0;
    let layerRect;
    hideAction(layer, function() {
        layerRect = layer.getBoundingClientRect();
    });
    return {
        x: x - layerRect.left,
        y: y - layerRect.top
    };
}

export function extend() {
    let options, name, src, copy, copyIsArray,
        target = arguments[0] || {},
        targetType = typeof target,
        toString = Object.prototype.toString,
        i = 1,
        length = arguments.length,
        deep = false;

    // 处理深拷贝
    if (targetType === 'boolean') {
        deep = target;

        // Skip the boolean and the target
        target = arguments[i] || {};
        targetType = typeof target;
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (targetType !== 'object' && targetType !== 'function') {
        target = {};
    }

    // 如果没有合并的对象，则表示 target 为合并对象，将 target 合并给当前函数的持有者
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {

        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {

            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // 防止死循环
                if (target === copy) {
                    continue;
                }

                // 深拷贝对象或者数组
                if (deep && copy &&
                    ((copyIsArray = toString.call(copy) === '[object Array]') ||
                    (toString.call(copy) === '[object Object]'))) {

                    if (copyIsArray) {
                        copyIsArray = false;
                        src = src && (toString.call(src) === '[object Array]') ? src : [];

                    } else {
                        src = src && (toString.call(src) === '[object Object]') ? src : {};
                    }

                    target[name] = extend(deep, src, copy);

                } else if (copy !== undefined) { // 仅忽略未定义的值
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}

// 代理
let guid = 0;
export function proxy(func, target) {
    if (typeof target === 'string') {
        let tmp = func[target];
        target = func;
        func = tmp;
    }

    if (typeof func !== 'function') {
        return undefined;
    }

    let slice = Array.prototype.slice,
        args = slice.call(arguments, 2),
        proxy = function() {
            return func.apply(target || this, args.concat(slice.call(arguments)));
        };

    proxy.guid = func.guid = func.guid || guid++;

    return proxy;
}

/**
 * 让隐藏元素正确执行程序（IE9及以上浏览器）
 * @param  {DOM|Array} elems  DOM元素或者DOM元素组成的数组
 * @param  {Function}  func   需要执行的程序函数
 * @param  {Object}    target 执行程序时函数中 this 的指向
 */
let defaultDisplayMap = {};
export function hideAction(elems, func, target) {
    if (typeof elems !== 'object') {
        elems = [];
    }

    if (typeof elems.length === 'undefined') {
        elems = [elems];
    }

    let hideElems = [],
        hideElemsDisplay = [];

    for (let i = 0, elem; elem = elems[i++];) {

        while (elem instanceof HTMLElement) {

            let nodeName = elem.nodeName;

            if (!elem.getClientRects().length) {
                hideElems.push(elem);
                hideElemsDisplay.push(elem.style.display);

                let display = defaultDisplayMap[nodeName];
                if (!display) {
                    let temp = document.createElement(nodeName);
                    document.body.appendChild(temp);
                    display = window.getComputedStyle(temp).display;
                    temp.parentNode.removeChild(temp);

                    if (display === 'none') display = 'block';
                    defaultDisplayMap[nodeName] = display;
                }

                elem.style.display = display;
            }

            if (nodeName === 'BODY') break;
            elem = elem.parentNode;
        }
    }

    if (typeof(func) === 'function') func.call(target || this);

    let l = hideElems.length;
    while (l--) {
        hideElems.pop().style.display = hideElemsDisplay.pop();
    }
}

// 判断是否为百分比
export function isPercent(value) {
    return /%$/.test(value + '');
}

// 判断对象是否为数字
export function isNumber(obj) {
    return typeof obj === 'number';
}

// 判断对象是否为数组
export function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

// 类似数组对象转数组
export function toArray(obj) {
    return Array.prototype.map.call(obj, function(n) { return n });
}

// 创建元素
export function createElement(parentNode, className, id, prop) {
    let elem = document.createElement('DIV');

    if (typeof className === 'object') {
        prop = className;
        className = null;
    }

    if (typeof id === 'object') {
        prop = id;
        id = null;
    }

    if (typeof prop === 'object') {
        for (let p in prop) {
            elem.style[p] = prop[p];
        }
    }

    if (className) elem.className = className;
    if (id) elem.id = id;

    parentNode.appendChild(elem);

    return elem;
}

// 移除元素
export function removeElement(elem) {
    elem.parentNode && elem.parentNode.removeChild(elem);
}

// 获取元素（IE8及以上浏览器）
export function $(selector, context) {
    if (selector instanceof HTMLElement) {
        return [selector];
    } else if (typeof selector === 'object' && selector.length) {
        return toArray(selector);
    } else if (!selector || typeof selector !== 'string') {
        return [];
    }

    if (typeof context === 'string') {
        context = document.querySelector(context);
    }

    if (!(context instanceof HTMLElement)) {
        context = document;
    }

    return toArray(context.querySelectorAll(selector));
}

// 设置属性
export function attr(elem, prop, value) {
    if (typeof prop === 'object') {
        for (let p in prop) {
            elem[p] = prop[p];
        }
        return elem;
    }

    if (value === undefined) {
        return elem[prop];
    } else {
        elem[prop] = value;
        return elem;
    }
}

// 设置样式
export function css(elem, prop, value) {
    if (typeof prop === 'object') {
        for (let p in prop) {
            value = prop[p];
            if (isNumber(value)) value += 'px';
            elem.style[p] = value;
        }
        return elem;
    }

    if (value === undefined) {
        return window.getComputedStyle(elem)[prop];
    } else {
        if (isNumber(value)) value += 'px';
        elem.style[prop] = value;
        return elem;
    }
}

export function support(prop) {
    let testElem = document.documentElement;
    if (prop in testElem.style) return '';

    let testProp = prop.charAt(0).toUpperCase() + prop.substr(1),
        prefixs = [ 'Webkit', 'Moz', 'ms', 'O' ];

    for (let i = 0, prefix; prefix = prefixs[i++];) {
        if ((prefix + testProp) in testElem.style) {
            return '-' + prefix.toLowerCase() + '-';
        }
    }
}

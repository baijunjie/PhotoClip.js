import hideAction from '@module-factory/utils/hideAction';

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


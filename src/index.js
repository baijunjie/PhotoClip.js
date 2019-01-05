import Hammer from 'hammerjs';
import IScroll from 'iscroll/build/iscroll-zoom';
import lrz from 'lrz';
import bind from '@module-factory/utils/bind';
import destroy from '@module-factory/utils/destroy';
import extend from '@module-factory/utils/extend';
import isNumber from '@module-factory/utils/isNumber';
import isArray from '@module-factory/utils/isArray';
import isPercent from '@module-factory/utils/isPercent';
import createElement from '@module-factory/utils/createElement';
import removeElement from '@module-factory/utils/removeElement';
import hideAction from '@module-factory/utils/hideAction';
import support from '@module-factory/utils/support';
import css from '@module-factory/utils/css';
import attr from '@module-factory/utils/attr';
import $ from '@module-factory/utils/$';
import * as utils from './utils';

const is_mobile = !!navigator.userAgent.match(/mobile/i),
    is_android = !!navigator.userAgent.match(/android/i),

    // 测试浏览器是否支持 Transition 动画，以及支持的前缀
    supportTransition = support('transition'),
    prefix = support('transform'),

    noop = function() {};

let defaultOptions = {
    size: [100, 100],
    adaptive: '',
    outputSize: [0, 0],
    outputType: 'jpg',
    outputQuality: .8,
    maxZoom: 1,
    rotateFree: !is_android,
    view: '',
    file: '',
    ok: '',
    img: '',
    loadStart: noop,
    loadComplete: noop,
    loadError: noop,
    done: noop,
    fail: noop,
    lrzOption: {
        width: is_android ? 1000 : undefined,
        height: is_android ? 1000 : undefined,
        quality: .7
    },
    style: {
        maskColor: 'rgba(0,0,0,.5)',
        maskBorder: '2px dashed #ddd',
        jpgFillColor: '#fff'
    },
    errorMsg: {
        noSupport: '您的浏览器版本过于陈旧，无法支持裁图功能，请更换新的浏览器！',
        imgError: '不支持该图片格式，请选择常规格式的图片文件！',
        imgHandleError: '图片处理失败！请更换其它图片尝试。',
        imgLoadError: '图片读取失败！请更换其它图片尝试。',
        noImg: '没有可裁剪的图片！',
        clipError: '截图失败！当前图片源文件可能存在跨域问题，请确保图片与应用同源。如果您是在本地环境下执行本程序，请更换至服务器环境。'
    }
};

export default class PhotoClip {
    constructor(container, options) {
        container = $(container); // 获取容器
        if (container && container.length) {
            this._$container = container[0];
        } else {
            return;
        }

        this._options = extend(true, {}, defaultOptions, options);

        if (prefix === undefined) {
            this._options.errorMsg.noSupport && alert(this._options.errorMsg.noSupport);
        }

        this._init();
    }

    _init() {
        const options = this._options;

        // options 预设
        if (isNumber(options.size)) {
            options.size = [options.size, options.size];
        } else if (isArray(options.size)) {
            if (!isNumber(options.size[0]) || options.size[0] <= 0) options.size[0] = defaultOptions.size[0];
            if (!isNumber(options.size[1]) || options.size[1] <= 0) options.size[1] = defaultOptions.size[1];
        } else {
            options.size = extend({}, defaultOptions.size);
        }

        if (isNumber(options.outputSize)) {
            options.outputSize = [options.outputSize, 0];
        } else if (isArray(options.outputSize)) {
            if (!isNumber(options.outputSize[0]) || options.outputSize[0] < 0) options.outputSize[0] = defaultOptions.outputSize[0];
            if (!isNumber(options.outputSize[1]) || options.outputSize[1] < 0) options.outputSize[1] = defaultOptions.outputSize[1];
        } else {
            options.outputSize = extend({}, defaultOptions.outputSize);
        }

        if (options.outputType === 'jpg') {
            options.outputType = 'image/jpeg';
        } else { // 如果不是 jpg，则全部按 png 来对待
            options.outputType = 'image/png';
        }

        // 变量初始化
        if (isArray(options.adaptive)) {
            this._widthIsPercent = options.adaptive[0] && isPercent(options.adaptive[0]) ? options.adaptive[0] : false;
            this._heightIsPercent = options.adaptive[1] && isPercent(options.adaptive[1]) ? options.adaptive[1] : false;
        }

        this._outputWidth = options.outputSize[0];
        this._outputHeight = options.outputSize[1];

        this._canvas = document.createElement('canvas'); // 图片裁剪用到的画布
        this._iScroll = null; // 图片的scroll对象，包含图片的位置与缩放信息
        this._hammerManager = null; // hammer 管理对象

        this._clipWidth = 0;
        this._clipHeight = 0;
        this._clipSizeRatio = 1; // 截取框宽高比

        this._$img = null; // 图片的DOM对象
        this._imgLoaded = false; // 图片是否已经加载完成

        this._containerWidth = 0;
        this._containerHeight = 0;

        this._viewList = null; // 最终截图后呈现的视图容器的DOM数组
        this._fileList = null; // file 控件的DOM数组
        this._okList = null; // 截图按钮的DOM数组

        this._$mask = null;
        this._$mask_left = null;
        this._$mask_right = null;
        this._$mask_right = null;
        this._$mask_bottom = null;
        this._$clip_frame = null;

        this._$clipLayer = null; // 裁剪层，包含移动层
        this._$moveLayer = null; // 移动层，包含旋转层
        this._$rotateLayer = null; // 旋转层

        this._moveLayerWidth = 0; // 移动层的宽度(不跟随scale发生变化)
        this._moveLayerHeight = 0; // 移动层的高度(不跟随scale发生变化)
        this._moveLayerPaddingLeft = 0; // 当图片宽度小于裁剪框宽度时，移动层的补偿左边距(不跟随scale发生变化)
        this._moveLayerPaddingTop = 0; // 当图片高度小于裁剪框高度时，移动层的补偿顶边距(不跟随scale发生变化)

        this._atRotation = false; // 旋转层是否正在旋转中
        this._rotateLayerWidth = 0; // 旋转层所呈现矩形的宽度(不跟随scale发生变化)
        this._rotateLayerHeight = 0; // 旋转层所呈现矩形的高度(不跟随scale发生变化)
        this._rotateLayerX = 0; // 旋转层的当前X坐标(不跟随scale发生变化)
        this._rotateLayerY = 0; // 旋转层的当前Y坐标(不跟随scale发生变化)
        this._rotateLayerOriginX = 0; // 旋转层的旋转参考点X(不跟随scale发生变化)
        this._rotateLayerOriginY = 0; // 旋转层的旋转参考点Y(不跟随scale发生变化)
        this._curAngle = 0; // 旋转层的当前角度

        bind(
            this,
            '_resetScroll',
            '_rotateCW90',
            '_fileOnChangeHandle',
            '_clipImg',
            '_resize',
            'size',
            'load',
            'clear',
            'rotate',
            'scale',
            'clip',
            'destroy'
        );

        this._initElements();
        this._initScroll();
        this._initRotationEvent();
        this._initFile();

        this._resize();
        window.addEventListener('resize', this._resize);

        if (this._okList = $(options.ok)) {
            this._okList.forEach($ok => {
                $ok.addEventListener('click', this._clipImg);
            });
        }

        if (this._options.img) {
            this._lrzHandle(this._options.img);
        }
    }

    _initElements() {
        // 初始化容器
        const $container = this._$container,
            style = $container.style,
            containerOriginStyle = {};

        containerOriginStyle['user-select'] = style['user-select'];
        containerOriginStyle['overflow'] = style['overflow'];
        containerOriginStyle['position'] = style['position'];
        this._containerOriginStyle = containerOriginStyle;

        css($container, {
            'user-select': 'none',
            'overflow': 'hidden'
        });

        if (css($container, 'position') === 'static') {
            css($container, 'position', 'relative');
        }

        // 创建裁剪层
        this._$clipLayer = createElement($container, 'photo-clip-layer', {
            'position': 'absolute',
            'left': '50%',
            'top': '50%'
        });

        this._$moveLayer = createElement(this._$clipLayer, 'photo-clip-move-layer');
        this._$rotateLayer = createElement(this._$moveLayer, 'photo-clip-rotate-layer');

        // 创建遮罩
        const $mask = this._$mask = createElement($container, 'photo-clip-mask', {
            'position': 'absolute',
            'left': 0,
            'top': 0,
            'width': '100%',
            'height': '100%',
            'pointer-events': 'none'
        });

        const options = this._options,
            maskColor = options.style.maskColor,
            maskBorder = options.style.maskBorder;

        this._$mask_left = createElement($mask, 'photo-clip-mask-left', {
            'position': 'absolute',
            'left': 0,
            'right': '50%',
            'top': '50%',
            'bottom': '50%',
            'width': 'auto',
            'background-color': maskColor
        });
        this._$mask_right = createElement($mask, 'photo-clip-mask-right', {
            'position': 'absolute',
            'left': '50%',
            'right': 0,
            'top': '50%',
            'bottom': '50%',
            'background-color': maskColor
        });
        this._$mask_top = createElement($mask, 'photo-clip-mask-top', {
            'position': 'absolute',
            'left': 0,
            'right': 0,
            'top': 0,
            'bottom': '50%',
            'background-color': maskColor
        });
        this._$mask_bottom = createElement($mask, 'photo-clip-mask-bottom', {
            'position': 'absolute',
            'left': 0,
            'right': 0,
            'top': '50%',
            'bottom': 0,
            'background-color': maskColor
        });

        // 创建截取框
        this._$clip_frame = createElement($mask, 'photo-clip-area', {
            'border': maskBorder,
            'position': 'absolute',
            'left': '50%',
            'top': '50%'
        });

        // 初始化视图容器
        this._viewList = $(options.view);
        if (this._viewList) {
            const viewOriginStyleList = [];
            this._viewList.forEach(function($view, i) {
                const style = $view.style,
                    viewOriginStyle = {};
                viewOriginStyle['background-repeat'] = style['background-repeat'];
                viewOriginStyle['background-position'] = style['background-position'];
                viewOriginStyle['background-size'] = style['background-size'];
                viewOriginStyleList[i] = viewOriginStyle;

                css($view, {
                    'background-repeat': 'no-repeat',
                    'background-position': 'center',
                    'background-size': 'contain'
                });
            });
            this._viewOriginStyleList = viewOriginStyleList;
        }
    }

    _initScroll() {
        this._iScroll = new IScroll(this._$clipLayer, {
            zoom: true,
            scrollX: true,
            scrollY: true,
            freeScroll: true,
            mouseWheel: true,
            disablePointer: true, // important to disable the pointer events that causes the issues
            disableTouch: false, // false if you want the slider to be usable with touch devices
            disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)
            wheelAction: 'zoom',
            bounceTime: 300
        });

        this._iScroll.on('zoomEnd', () => {
            this._calcScale();
            this._resizeMoveLayer();
            this._refreshScroll();
        });
    }

    // 重置 iScroll
    _resetScroll() {
        const iScroll = this._iScroll;

        this._calcScale();

        const scale = iScroll.scale = iScroll.options.startZoom;

        this._resizeMoveLayer();

        // 重置旋转层
        this._rotateLayerX = 0;
        this._rotateLayerY = 0;
        this._curAngle = 0;

        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            this._curAngle
        );

        // 初始化居中
        iScroll.scrollTo(
            (this._clipWidth - this._moveLayerWidth * scale) * .5,
            (this._clipHeight - this._moveLayerHeight * scale) * .5
        );

        this._refreshScroll();
    }

    // 刷新 iScroll
    // duration 表示移动层超出容器时的复位动画持续时长
    _refreshScroll(duration) {
        duration = duration || 0;

        const iScroll = this._iScroll,
            scale = iScroll.scale,
            iScrollOptions = iScroll.options;

        const lastScale = Math.max(iScrollOptions.zoomMin, Math.min(iScrollOptions.zoomMax, scale));
        if (lastScale !== scale) {
            iScroll.zoom(lastScale, undefined, undefined, duration);
        }

        iScroll.refresh(duration);
    }

    // 调整移动层
    _resizeMoveLayer() {
        const iScroll = this._iScroll,
            iScrollOptions = iScroll.options,
            scale = Math.max(iScrollOptions.zoomMin, Math.min(iScrollOptions.zoomMax, iScroll.scale));

        let width = this._rotateLayerWidth,
            height = this._rotateLayerHeight,
            clipWidth = this._clipWidth / scale,
            clipHeight = this._clipHeight / scale,
            ltClipArea = false;

        if (clipWidth > width) {
            ltClipArea = true;
            const offset = clipWidth - width;
            width += offset * 2;
            iScroll.x += (this._moveLayerPaddingLeft - offset) * scale;
            this._moveLayerPaddingLeft = offset;
        } else {
            this._moveLayerPaddingLeft = 0;
        }

        if (clipHeight > height) {
            ltClipArea = true;
            const offset = clipHeight - height;
            height += offset * 2;
            iScroll.y += (this._moveLayerPaddingTop - offset) * scale;
            this._moveLayerPaddingTop = offset;
        } else {
            this._moveLayerPaddingTop = 0;
        }

        if (ltClipArea) {
            setTransform(
                this._$rotateLayer,
                this._rotateLayerX + this._moveLayerPaddingLeft,
                this._rotateLayerY + this._moveLayerPaddingTop,
                this._curAngle
            );
            iScroll.scrollTo(iScroll.x, iScroll.y);
        }

        if (this._moveLayerWidth === width &&
            this._moveLayerHeight === height) return;

        this._moveLayerWidth = width;
        this._moveLayerHeight = height;

        css(this._$moveLayer, {
            'width': width,
            'height': height
        });

        // 在移动设备上，尤其是Android设备，当为一个元素重置了宽高时
        // 该元素的 offsetWidth/offsetHeight、clientWidth/clientHeight 等属性并不会立即更新，导致相关的js程序出现错误
        // iscroll 在刷新方法中正是使用了 offsetWidth/offsetHeight 来获取scroller元素($moveLayer)的宽高
        // 因此需要手动将元素重新添加进文档，迫使浏览器强制更新元素的宽高
        this._$clipLayer.appendChild(this._$moveLayer);
    }

    _calcScale() {
        const iScroll = this._iScroll,
            iScrollOptions = iScroll.options,
            width = this._rotateLayerWidth,
            height = this._rotateLayerHeight,
            maxZoom = this._options.maxZoom;

        if (width && height) {
            iScrollOptions.zoomMin = Math.min(1, utils.getScale(this._clipWidth, this._clipHeight, width, height));
            iScrollOptions.zoomMax = maxZoom;
            iScrollOptions.startZoom = Math.min(maxZoom, utils.getScale(this._containerWidth, this._containerHeight, width, height));
        } else {
            iScrollOptions.zoomMin = 1;
            iScrollOptions.zoomMax = 1;
            iScrollOptions.startZoom = 1;
        }

        // console.log('zoomMin', iScrollOptions.zoomMin);
        // console.log('zoomMax', iScrollOptions.zoomMax);
        // console.log('startZoom', iScrollOptions.startZoom);
    }

    _initRotationEvent() {
        if (is_mobile) {
            this._hammerManager = new Hammer.Manager(this._$moveLayer);
            this._hammerManager.add(new Hammer.Rotate());

            const rotateFree = this._options.rotateFree,
                bounceTime = this._iScroll.options.bounceTime;

            let startTouch,
                startAngle,
                curAngle;

            this._hammerManager.on('rotatestart', e => {
                if (this._atRotation) return;
                startTouch = true;

                if (rotateFree) {
                    startAngle = (e.rotation - this._curAngle) % 360;
                    this._rotateLayerRotateReady(e.center);
                } else {
                    startAngle = e.rotation;
                }
            });

            this._hammerManager.on('rotatemove', e => {
                if (!startTouch) return;
                curAngle = e.rotation - startAngle;
                rotateFree && this._rotateLayerRotate(curAngle);
            });

            this._hammerManager.on('rotateend rotatecancel', e => {
                if (!startTouch) return;
                startTouch = false;

                if (!rotateFree) {
                    curAngle %= 360;
                    if (curAngle > 180) curAngle -= 360;
                    else if (curAngle < -180) curAngle += 360;

                    if (curAngle > 30) {
                        this._rotateBy(90, bounceTime, e.center);
                    } else if (curAngle < -30) {
                        this._rotateBy(-90, bounceTime, e.center);
                    }
                    return;
                }

                // 接近整90度方向时，进行校正
                let angle = curAngle % 360;
                if (angle < 0) angle += 360;

                if (angle < 10) {
                    curAngle += -angle;
                } else if (angle > 80 && angle < 100) {
                    curAngle += 90 - angle;
                } else if (angle > 170 && angle < 190) {
                    curAngle += 180 - angle;
                } else if (angle > 260 && angle < 280) {
                    curAngle += 270 - angle;
                } else if (angle > 350) {
                    curAngle += 360 - angle;
                }

                this._rotateLayerRotateFinish(curAngle, bounceTime);
            });
        } else {
            this._$moveLayer.addEventListener('dblclick', this._rotateCW90);
        }
    }

    _rotateCW90(e) {
        this._rotateBy(90, this._iScroll.options.bounceTime, { x: e.clientX, y: e.clientY });
    }

    _rotateBy(angle, duration, center) {
        this._rotateTo(this._curAngle + angle, duration, center);
    }

    _rotateTo(angle, duration, center) {
        if (this._atRotation) return;

        this._rotateLayerRotateReady(center);

        // 旋转层旋转结束
        this._rotateLayerRotateFinish(angle, duration);
    }

    // 旋转层旋转准备
    _rotateLayerRotateReady(center) {
        const scale = this._iScroll.scale;
        let coord; // 旋转参考点在移动层中的坐标

        if (!center) {
            coord = utils.loaclToLoacl(this._$moveLayer, this._$clipLayer, this._clipWidth * .5, this._clipHeight * .5);
        } else {
            coord = utils.globalToLoacl(this._$moveLayer, center.x, center.y);
        }

        // 由于得到的坐标是在缩放后坐标系上的坐标，因此需要除以缩放比例
        coord.x /= scale;
        coord.y /= scale;

        // 旋转参考点相对于旋转层零位（旋转层旋转前左上角）的坐标
        const coordBy0 = {
            x: coord.x - (this._rotateLayerX + this._moveLayerPaddingLeft),
            y: coord.y - (this._rotateLayerY + this._moveLayerPaddingTop)
        };

        // 求出旋转层旋转前的旋转参考点
        // 这个参考点就是旋转中心点映射在旋转层图片上的坐标
        // 这个位置表示旋转层旋转前，该点所对应的坐标
        const origin = utils.pointRotate(coordBy0, -this._curAngle);
        this._rotateLayerOriginX = origin.x;
        this._rotateLayerOriginY = origin.y;

        // 设置参考点，算出新参考点作用下的旋转层位移，然后进行补差
        const rect = this._$rotateLayer.getBoundingClientRect();
        setOrigin(
            this._$rotateLayer,
            this._rotateLayerOriginX,
            this._rotateLayerOriginY
        );
        const newRect = this._$rotateLayer.getBoundingClientRect();
        this._rotateLayerX += (rect.left - newRect.left) / scale;
        this._rotateLayerY += (rect.top - newRect.top) / scale;
        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            this._curAngle
        );
    }

    // 旋转层旋转
    _rotateLayerRotate(angle) {
        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            angle
        );
        this._curAngle = angle;
    }

    // 旋转层旋转结束
    _rotateLayerRotateFinish(angle, duration) {
        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            angle
        );

        const iScroll = this._iScroll,
            scale = iScroll.scale,
            iScrollOptions = iScroll.options;

        // 获取旋转后的矩形
        const rect = this._$rotateLayer.getBoundingClientRect();

        // 更新旋转层当前所呈现矩形的宽高
        this._rotateLayerWidth = rect.width / scale;
        this._rotateLayerHeight = rect.height / scale;

        // 当参考点为零时，获取位移后的矩形
        setOrigin(this._$rotateLayer, 0, 0);
        const rectByOrigin0 = this._$rotateLayer.getBoundingClientRect();

        // 获取旋转前（零度）的矩形
        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            0
        );
        const rectByAngle0 = this._$rotateLayer.getBoundingClientRect();

        // 当参考点为零时，旋转层旋转后，在形成的新矩形中，旋转层零位（旋转层旋转前左上角）的新坐标
        this._rotateLayerX = (rectByAngle0.left - rectByOrigin0.left) / scale;
        this._rotateLayerY = (rectByAngle0.top - rectByOrigin0.top) / scale;

        this._calcScale();
        this._resizeMoveLayer();

        // 获取移动层的矩形
        const moveLayerRect = this._$moveLayer.getBoundingClientRect();

        // 求出移动层与旋转层之间的位置偏移
        // 由于直接应用在移动层，因此不需要根据缩放换算
        // 注意，这里的偏移有可能还包含缩放过量时多出来的偏移
        let offset = {
            x: rect.left - (this._moveLayerPaddingLeft * scale) - moveLayerRect.left,
            y: rect.top - (this._moveLayerPaddingTop * scale) - moveLayerRect.top
        };

        iScroll.scrollTo(
            iScroll.x + offset.x,
            iScroll.y + offset.y
        );

        this._refreshScroll(iScroll.options.bounceTime);

        // 由于 offset 可能还包含缩放过量时多出来的偏移
        // 因此，这里判断是否缩放过量
        const lastScale = Math.max(iScrollOptions.zoomMin, Math.min(iScrollOptions.zoomMax, scale));
        if (lastScale !== scale) {
            // 当缩放过量时，将 offset 换算为最终的正常比例对应的值
            offset.x = offset.x / scale * lastScale;
            offset.y = offset.y / scale * lastScale;
        }

        // 由于双指旋转时也伴随着缩放，因此这里代码执行完后，将会执行 iscroll 的 _zoomEnd
        // 而该方法会基于 touchstart 时记录的位置重新计算 x、y，这将导致手指离开屏幕后，移动层又会向回移动一段距离
        // 所以这里也要将 startX、startY 这两个值进行补差，而这个差值必须是最终的正常比例对应的值
        iScroll.startX += offset.x;
        iScroll.startY += offset.y;

        if (angle !== this._curAngle && duration && isNumber(duration) && supportTransition !== undefined) {
            // 计算旋转层参考点，设为零位前后的偏移量
            offset = {
                x: (rectByOrigin0.left - rect.left) / scale,
                y: (rectByOrigin0.top - rect.top) / scale
            };
            // 将旋转参考点设回前值，同时调整偏移量，保证视图位置不变，准备开始动画
            setOrigin(
                this._$rotateLayer,
                this._rotateLayerOriginX,
                this._rotateLayerOriginY
            );

            const targetX = this._rotateLayerX + this._moveLayerPaddingLeft + offset.x,
                targetY = this._rotateLayerY + this._moveLayerPaddingTop + offset.y;

            setTransform(
                this._$rotateLayer,
                targetX,
                targetY,
                this._curAngle
            );

            // 开始旋转
            this._atRotation = true;
            setTransition(
                this._$rotateLayer,
                targetX,
                targetY,
                angle,
                duration,
                () => {
                    this._atRotation = false;
                    this._rotateFinishUpdataElem(angle);
                }
            );
        } else {
            this._rotateFinishUpdataElem(angle);
        }
    }

    // 旋转结束更新相关元素
    _rotateFinishUpdataElem(angle) {
        setOrigin(
            this._$rotateLayer,
            this._rotateLayerOriginX = 0,
            this._rotateLayerOriginY = 0
        );
        setTransform(
            this._$rotateLayer,
            this._rotateLayerX + this._moveLayerPaddingLeft,
            this._rotateLayerY + this._moveLayerPaddingTop,
            this._curAngle = angle % 360
        );
    }

    _initFile() {
        const options = this._options;

        if (this._fileList = $(options.file)) {
            this._fileList.forEach($file => {
                // 移动端如果设置 'accept'，会使相册打开缓慢，因此这里只为非移动端设置
                if (!is_mobile) {
                    attr($file, 'accept', 'image/jpeg, image/x-png, image/png, image/gif');
                }

                $file.addEventListener('change', this._fileOnChangeHandle);
            });
        }
    }

    _fileOnChangeHandle(e) {
        const files = e.target.files;

        if (files.length) {
            this._lrzHandle(files[0]);
        }
    }

    _lrzHandle(src) {
        const options = this._options,
            errorMsg = options.errorMsg;

        if (typeof src === 'object' && src.type && !/image\/\w+/.test(src.type)) {
            options.loadError.call(this, errorMsg.imgError);
            return false;
        }

        this._imgLoaded = false;
        options.loadStart.call(this, src);

        try {
            lrz(src, options.lrzOption)
                .then(rst => {
                    // 处理成功会执行
                    this._clearImg();
                    this._createImg(rst.base64);
                })
                .catch(err => {
                    // 处理失败会执行
                    options.loadError.call(this, errorMsg.imgHandleError, err);
                });
        } catch(err) {
            options.loadError.call(this, errorMsg.imgHandleError, err);
            throw err;
        }
    }

    _clearImg() {
        if (!this._$img) return;

        // 删除旧的图片以释放内存，防止IOS设备的 webview 崩溃
        this._$img.onload = null;
        this._$img.onerror = null;
        removeElement(this._$img);
        this._$img = null;
        this._imgLoaded = false;
    }

    _createImg(src) {
        const options = this._options,
            errorMsg = options.errorMsg;

        this._$img = new Image();

        css(this._$img, {
            'display': 'block',
            'user-select': 'none',
            'pointer-events': 'none'
        });

        this._$img.onload = e => {
            const img = e.target;
            this._imgLoaded = true;

            options.loadComplete.call(this, img);

            this._$rotateLayer.appendChild(img);
            this._rotateLayerWidth = img.naturalWidth;
            this._rotateLayerHeight = img.naturalHeight;
            css(this._$rotateLayer, {
                'width': this._rotateLayerWidth,
                'height': this._rotateLayerHeight
            });

            hideAction([img, this._$moveLayer], this._resetScroll);
        };

        this._$img.onerror = e => {
            options.loadError.call(this, errorMsg.imgLoadError, e);
        };

        attr(this._$img, 'src', src);
    }

    _clipImg() {
        const options = this._options,
            errorMsg = options.errorMsg;

        if (!this._imgLoaded) {
            options.fail.call(this, errorMsg.noImg);
            return;
        }

        const local = utils.loaclToLoacl(this._$moveLayer, this._$clipLayer),
            scale = this._iScroll.scale,
            ctx = this._canvas.getContext('2d');

        let scaleX = 1,
            scaleY = 1;

        if (this._outputWidth || this._outputHeight) {
            this._canvas.width = this._outputWidth;
            this._canvas.height = this._outputHeight;
            scaleX = this._outputWidth / this._clipWidth * scale;
            scaleY = this._outputHeight / this._clipHeight * scale;
        } else {
            this._canvas.width = this._clipWidth / scale;
            this._canvas.height = this._clipHeight / scale;
        }

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.fillStyle = options.outputType === 'image/png' ? 'transparent' : options.style.jpgFillColor;
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.save();

        ctx.scale(scaleX, scaleY);
        ctx.translate(
            this._rotateLayerX + this._moveLayerPaddingLeft - local.x / scale,
            this._rotateLayerY + this._moveLayerPaddingTop - local.y / scale
        );
        ctx.rotate(this._curAngle * Math.PI / 180);

        ctx.drawImage(this._$img, 0, 0);
        ctx.restore();

        try {
            const dataURL = this._canvas.toDataURL(options.outputType, options.outputQuality);
            if (this._viewList) {
                this._viewList.forEach($view => {
                    css($view, 'background-image', `url(${dataURL})`);
                });
            }

            options.done.call(this, dataURL);

            return dataURL;
        } catch(err) {
            options.fail.call(this, errorMsg.clipError);
            throw err;
        }
    }

    _resize(width, height) {
        hideAction(this._$container, function() {
            this._containerWidth = this._$container.offsetWidth;
            this._containerHeight = this._$container.offsetHeight;
        }, this);

        const size = this._options.size,
            oldClipWidth = this._clipWidth,
            oldClipHeight = this._clipHeight;

        if (isNumber(width)) size[0] = width;
        if (isNumber(height)) size[1] = height;

        if (this._widthIsPercent || this._heightIsPercent) {
            const ratio = size[0] / size[1];

            if (this._widthIsPercent) {
                this._clipWidth = this._containerWidth / 100 * parseFloat(this._widthIsPercent);
                if (!this._heightIsPercent) {
                    this._clipHeight = this._clipWidth / ratio;
                }
            }

            if (this._heightIsPercent) {
                this._clipHeight = this._containerHeight / 100 * parseFloat(this._heightIsPercent);
                if (!this._widthIsPercent) {
                    this._clipWidth = this._clipHeight * ratio;
                }
            }

        } else {
            this._clipWidth = size[0];
            this._clipHeight = size[1];
        }

        const clipWidth = this._clipWidth,
            clipHeight = this._clipHeight;

        this._clipSizeRatio = clipWidth / clipHeight;

        if (this._outputWidth && !this._outputHeight) {
            this._outputHeight = this._outputWidth / this._clipSizeRatio;
        }

        if (this._outputHeight && !this._outputWidth) {
            this._outputWidth = this._outputHeight * this._clipSizeRatio;
        }

        css(this._$clipLayer, {
            'width': clipWidth,
            'height': clipHeight,
            'margin-left': -clipWidth/2,
            'margin-top': -clipHeight/2
        });
        css(this._$mask_left, {
            'margin-right': clipWidth/2,
            'margin-top': -clipHeight/2,
            'margin-bottom': -clipHeight/2
        });
        css(this._$mask_right, {
            'margin-left': clipWidth/2,
            'margin-top': -clipHeight/2,
            'margin-bottom': -clipHeight/2
        });
        css(this._$mask_top, {
            'margin-bottom': clipHeight/2
        });
        css(this._$mask_bottom, {
            'margin-top': clipHeight/2
        });
        css(this._$clip_frame, {
            'width': clipWidth,
            'height': clipHeight
        });
        css(this._$clip_frame, prefix + 'transform', 'translate(-50%, -50%)');

        if (clipWidth !== oldClipWidth || clipHeight !== oldClipHeight) {
            this._calcScale();
            this._resizeMoveLayer();
            this._refreshScroll();

            const iScroll = this._iScroll,
                scale = iScroll.scale,
                offsetX = (clipWidth - oldClipWidth) * .5 * scale,
                offsetY = (clipHeight - oldClipHeight) * .5 * scale;
            iScroll.scrollBy(offsetX, offsetY);
        }
    }

    /**
     * 设置截取框的宽高
     * 如果设置了 adaptive 选项，则该方法仅用于修改截取框的宽高比例
     * @param  {Number} width  截取框的宽度
     * @param  {Number} height 截取框的高度
     * @return {PhotoClip}     返回 PhotoClip 的实例对象
     */
    size(width, height) {
        this._resize(width, height);
        return this;
    }

    /**
     * 加载一张图片
     * @param  {String|Object} src 图片的 url，或者图片的 file 文件对象
     * @return {PhotoClip}         返回 PhotoClip 的实例对象
     */
    load(src) {
        this._lrzHandle(src);
        return this;
    }

    /**
     * 清除当前图片
     * @return {PhotoClip}  返回 PhotoClip 的实例对象
     */
    clear() {
        this._clearImg();
        this._resetScroll();
        if (this._fileList) {
            this._fileList.forEach(function($file) {
                $file.value = '';
            });
        }
        return this;
    }

    /**
     * 图片旋转到指定角度
     * @param  {Number} angle      可选。旋转的角度
     * @param  {Number} duration   可选。旋转动画的时长，如果为 0 或 false，则表示没有过渡动画
     * @return {PhotoClip|Number}  返回 PhotoClip 的实例对象。如果参数为空，则返回当前的旋转角度
     */
    rotate(angle, duration) {
        if (angle === undefined) return this._curAngle;
        this._rotateTo(angle, duration);
        return this;
    }

    /**
     * 图片缩放到指定比例，如果超出缩放范围，则会被缩放到可缩放极限
     * @param  {Number} zoom       可选。缩放比例，取值在 0 - 1 之间
     * @param  {Number} duration   可选。缩放动画的时长，如果为 0 或 false，则表示没有过渡动画
     * @return {PhotoClip|Number}  返回 PhotoClip 的实例对象。如果参数为空，则返回当前的缩放比例
     */
    scale(zoom, duration) {
        if (zoom === undefined) return this._iScroll.scale;
        this._iScroll.zoom(zoom, undefined, undefined, duration);
        return this;
    }

    /**
     * 截图
     * @return {String}  返回截取后图片的 Base64 字符串
     */
    clip() {
        return this._clipImg();
    }

    /**
     * 销毁
     * @return {Undefined}  无返回值
     */
    destroy() {
        window.removeEventListener('resize', this._resize);

        this._$container.removeChild(this._$clipLayer);
        this._$container.removeChild(this._$mask);

        css(this._$container, this._containerOriginStyle);

        if (this._iScroll) {
            this._iScroll.destroy();
        }

        if (this._hammerManager) {
            this._hammerManager.off('rotatemove');
            this._hammerManager.off('rotateend');
            this._hammerManager.destroy();
        } else {
            this._$moveLayer.removeEventListener('dblclick', this._rotateCW90);
        }

        if (this._$img) {
            this._$img.onload = null;
            this._$img.onerror = null;
        }

        if (this._viewList) {
            this._viewList.forEach(($view, i) => {
                css($view, this._viewOriginStyleList[i]);
            });
        }

        if (this._fileList) {
            this._fileList.forEach($file => {
                $file.removeEventListener('change', this._fileOnChangeHandle);
                $file.value = null;
            });
        }

        if (this._okList) {
            this._okList.forEach($ok =>  {
                $ok.removeEventListener('click', this._clipImg);
            });
        }

        destroy(this);
    }
};

// 设置变换注册点
function setOrigin($obj, originX, originY) {
    originX = (originX || 0).toFixed(2);
    originY = (originY || 0).toFixed(2);
    css($obj, prefix + 'transform-origin', originX + 'px ' + originY + 'px');
}

// 设置变换坐标与旋转角度
function setTransform($obj, x, y, angle) {
    // translate(x, y) 中坐标的小数点位数过多会引发 bug
    // 因此这里需要保留两位小数
    x = x.toFixed(2);
    y = y.toFixed(2);
    angle = angle.toFixed(2);

    css($obj, prefix + 'transform', 'translateZ(0) translate(' + x + 'px,' + y + 'px) rotate(' + angle + 'deg)');
}

// 设置变换动画
function setTransition($obj, x, y, angle, dur, fn) {
    // 这里需要先读取之前设置好的transform样式，强制浏览器将该样式值渲染到元素
    // 否则浏览器可能出于性能考虑，将暂缓样式渲染，等到之后所有样式设置完成后再统一渲染
    // 这样就会导致之前设置的位移也被应用到动画中
    css($obj, prefix + 'transform');
    // 这里应用的缓动与 iScroll 的默认缓动相同
    css($obj, prefix + 'transition', prefix + 'transform ' + dur + 'ms cubic-bezier(0.1, 0.57, 0.1, 1)');
    setTransform($obj, x, y, angle);

    setTimeout(function() {
        css($obj, prefix + 'transition', '');
        fn();
    }, dur);
}


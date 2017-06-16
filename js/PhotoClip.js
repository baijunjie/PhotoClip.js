/**
 * PhotoClip v3.2.0
 * (c) 2014-2017 BaiJunjie
 * MIT Licensed.
 *
 * https://github.com/baijunjie/PhotoClip.js
 *
 * 依赖插件
 * - iscroll-zoom.js
 * - hammer.js
 * - lrz.all.bundle.js
 *
 * @brief 一款手势驱动的裁图插件
 *        在移动设备上双指捏合为缩放，双指转动为旋转
 *        在PC设备上鼠标滚轮为缩放，每次双击则顺时针旋转90度
 *
 * option 参数配置
 *
 * - size                {Number|Array}        截取框大小。
 *                                             当值为数字时，表示截取框为宽高都等于该值的正方形。
 *                                             当值为数组时，数组中索引[0]和[1]所对应的值分别表示宽和高。
 *                                             默认值为[100,100]。
 * - adaptive            {String|Array}        截取框自适应。设置该选项后，size 选项将会失效，此时 size 进用于计算截取框的宽高比例。
 *                                             当值为一个百分数字符串时，表示截取框的宽度百分比。
 *                                             当值为数组时，数组中索引[0]和[1]所对应的值分别表示宽和高的百分比。
 *                                             当宽或高有一项值未设置或值无效时，则该项会根据 size 选项中定义的宽高比例自适应。
 *                                             默认为 ''。
 * - outputSize          {Number|Array}        输出图像大小。
 *                                             当值为数字时，表示输出宽度，此时高度根据截取框比例自适应。
 *                                             当值为数组时，数组中索引[0]和[1]所对应的值分别表示宽和高，若宽或高有一项值无效，则会根据另一项等比自适应。
 *                                             默认值为[0,0]，表示输出图像原始大小。
 *
 * - outputType          {String}              指定输出图片的类型，可选 'jpg' 和 'png' 两种种类型，默认为 'jpg'。
 * - outputQuality       {Number}              图片输出质量，仅对 jpeg 格式的图片有效，取值 0 - 1，默认为0.8。（这个质量并不是图片的最终质量，而是在经过 lrz 插件压缩后的基础上输出的质量。相当于 outputQuality * lrzOption.quality）
 * - maxZoom             {Number}              图片的最大缩放比，默认为 1。
 * - rotateFree          {Boolean}             是否启用图片自由旋转。由于安卓浏览器上存在性能问题，因此在安卓设备上默认关闭。
 * - view                {String|HTMLElement}  显示截取后图像的容器的选择器或者DOM对象。如果有多个，可使用英文逗号隔开的选择器字符串，或者DOM对象数组。
 * - file                {String|HTMLElement}  上传图片的 <input type="file"> 控件的选择器或者DOM对象。如果有多个，可使用英文逗号隔开的选择器字符串，或者DOM对象数组。
 * - ok                  {String|HTMLElement}  确认截图按钮的选择器或者DOM对象。如果有多个，可使用英文逗号隔开的选择器字符串，或者DOM对象数组。
 * - img                 {String}              需要裁剪图片的url地址。该参数表示当前立即开始读取图片，不需要使用 file 控件获取。注意，加载的图片必须要与本程序同源，如果图片跨域，则无法截图。
 *
 * - loadStart           {Function}            图片开始加载的回调函数。this指向当前 PhotoClip 的实例对象，并将正在加载的 file 对象作为参数传入。（如果是使用非 file 的方式加载图片，则该参数为图片的 url）
 * - loadComplete        {Function}            图片加载完成的回调函数。this指向当前 PhotoClip 的实例对象，并将图片的 <img> 对象作为参数传入。
 * - loadError           {Function}            图片加载失败的回调函数。this指向当前 PhotoClip 的实例对象，并将错误信息作为第一个参数传入，如果还有其它错误对象或者信息会作为第二个参数传入。
 * - done                {Function}            裁剪完成的回调函数。this指向当前 PhotoClip 的实例对象，会将裁剪出的图像数据DataURL作为参数传入。
 * - fail                {Function}            裁剪失败的回调函数。this指向当前 PhotoClip 的实例对象，会将失败信息作为参数传入。
 *
 * - lrzOption           {Object}              lrz 压缩插件的配置参数。该压缩插件作用于图片从相册输出到移动设备浏览器过程中的压缩，配置的高低将直接关系到图片在移动设备上操作的流畅度。以下为子属性：
 * ----- width           {Number}              图片最大不超过的宽度，默认为原图宽度，高度不设时会适应宽度。（由于安卓浏览器存在性能问题，所以默认值为 1000）
 * ----- height          {Number}              图片最大不超过的高度，默认为原图高度，宽度不设时会适应高度。（由于安卓浏览器存在性能问题，所以默认值为 1000）
 * ----- quality         {Number}              图片压缩质量，仅对 jpeg 格式的图片有效，取值 0 - 1，默认为0.7。（这个质量不是最终输出的质量，与 options.outputQuality 是相乘关系）
 *
 * - style               {Object}              样式配置。以下为子属性：
 * ----- maskColor       {String}              遮罩层的颜色。默认为 'rgba(0,0,0,.5)'。
 * ----- maskBorder      {String}              遮罩层的 border 样式。默认为 '2px dashed #ddd'。
 * ----- jpgFillColor    {String}              当输出 jpg 格式时透明区域的填充色。默认为 '#fff'。
 *
 * - errorMsg            {Object}              错误信息对象，包含各个阶段出错时的文字说明。以下为子属性：
 * ----- noSupport       {String}              浏览器无法支持本插件。将会使用 alert 弹出该信息，若不希望弹出，可将该值置空。
 * ----- imgError        {String}              使用 file 控件读取图片格式错误时的错误信息。将会在 loadError 回调的错误信息中输出。
 * ----- imgHandleError  {String}              lrz 压缩插件处理图片失败时的错误信息。将会在 loadError 回调的错误信息中输出。
 * ----- imgLoadError    {String}              图片加载出错时的错误信息。将会在 loadError 回调的错误信息中输出。
 * ----- noImg           {String}              没有加载完成的图片时，执行截图操作时的错误信息。将会在 fail 回调的失败信息中输出。
 * ----- clipError       {String}              截图出错时的错误信息。将会在 fail 回调的失败信息中输出。
 */

(function(root, factory) {
	'use strict';

	if (typeof module === 'object' && typeof exports === 'object') {
		module.exports = factory(
			require('./iscroll-zoom'),
			require('./hammer.min'),
			require('./lrz.all.bundle')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(['iscroll-zoom', 'hammer', 'lrz'], factory);
	} else {
		root.PhotoClip = factory(root.IScroll, root.Hammer, root.lrz);
	}

}(this, function(IScroll, Hammer, lrz) {
	'use strict';

	var is_mobile = !!navigator.userAgent.match(/mobile/i),
		is_android = !!navigator.userAgent.match(/android/i),

		// 测试浏览器是否支持 Transition 动画，以及支持的前缀
		supportTransition = support('transition'),
		prefix = support('transform'),

		noop = function() {},

		defaultOptions = {
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

	function PhotoClip(container, options) {
		if (!(this instanceof PhotoClip)) {
			return new PhotoClip(options);
		}

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

	var p = PhotoClip.prototype;

	p.constructor = PhotoClip;

	p._init = function() {
		var self = this,
			options = this._options;

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
		this._imgLoading = false; // 正在读取图片
		this._imgLoaded = false; // 图片是否已经加载完成

		this._containerWidth = 0;
		this._containerHeight = 0;

		this._$clipLayer = null; // 裁剪层，包含移动层
		this._$moveLayer = null; // 移动层，包含旋转层
		this._$rotationLayer = null; // 旋转层

		this._viewList = null; // 最终截图后呈现的视图容器的DOM数组
		this._fileList = null; // file 控件的DOM数组
		this._okList = null; // 截图按钮的DOM数组

		this._$mask = null;
		this._$mask_left = null;
		this._$mask_right = null;
		this._$mask_right = null;
		this._$mask_bottom = null;
		this._$clip_frame = null;

		this._atRotation = false; // 旋转层是否正在旋转中
		this._rotationLayerWidth = 0; // 旋转层的宽度
		this._rotationLayerHeight = 0; // 旋转层的高度
		this._rotationLayerX = 0; // 旋转层的当前X坐标
		this._rotationLayerY = 0; // 旋转层的当前Y坐标
		this._rotationLayerOriginX = 0; // 旋转层的旋转参考点X
		this._rotationLayerOriginY = 0; // 旋转层的旋转参考点Y
		this._curAngle = 0; // 旋转层的当前角度

		this._initProxy();

		this._initElements();
		this._initScroll();
		this._initRotationEvent();
		this._initFile();

		this._resize();
		window.addEventListener('resize', this._resize);

		if (this._okList = $(options.ok)) {
			this._okList.forEach(function($ok) {
				$ok.addEventListener('click', self._clipImg);
			});
		}

		if (this._options.img) {
			this._lrzHandle(this._options.img);
		}
	};

	p._initElements = function() {
		// 初始化容器
		var $container = this._$container,
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
		this._$rotationLayer = createElement(this._$moveLayer, 'photo-clip-rotation-layer');

		// 创建遮罩
		var $mask = this._$mask = createElement($container, 'photo-clip-mask', {
			'position': 'absolute',
			'left': 0,
			'top': 0,
			'width': '100%',
			'height': '100%',
			'pointer-events': 'none'
		});

		var options = this._options,
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
			var viewOriginStyleList = [];
			this._viewList.forEach(function($view, i) {
				var style = $view.style,
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
	};

	p._initScroll = function() {
		this._iScroll = new IScroll(this._$clipLayer, {
			zoom: true,
			scrollX: true,
			scrollY: true,
			freeScroll: true,
			mouseWheel: true,
			wheelAction: 'zoom',
			bounceTime: 300
		});
	};

	// 刷新 iScroll
	// duration 表示移动层超出容器时的复位动画持续时长
	p._refreshScroll = function(duration) {
		duration = duration || 0;

		var iScrollOptions = this._iScroll.options,
			maxZoom = this._options.maxZoom,
			width = this._rotationLayerWidth,
			height = this._rotationLayerHeight;

		if (width && height) {
			iScrollOptions.zoomMin = getScale(this._clipWidth, this._clipHeight, width, height);
			iScrollOptions.zoomMax = Math.max(maxZoom, iScrollOptions.zoomMin);
			iScrollOptions.startZoom = Math.min(iScrollOptions.zoomMax, getScale(this._containerWidth, this._containerHeight, width, height));
		} else {
			iScrollOptions.zoomMin = 1;
			iScrollOptions.zoomMax = maxZoom;
			iScrollOptions.startZoom = 1;
		}

		css(this._$moveLayer, {
			'width': width,
			'height': height
		});

		// 在移动设备上，尤其是Android设备，当为一个元素重置了宽高时
		// 该元素的 offsetWidth/offsetHeight、clientWidth/clientHeight 等属性并不会立即更新，导致相关的js程序出现错误
		// iscroll 在刷新方法中正是使用了 offsetWidth/offsetHeight 来获取scroller元素($moveLayer)的宽高
		// 因此需要手动将元素重新添加进文档，迫使浏览器强制更新元素的宽高
		this._$clipLayer.appendChild(this._$moveLayer);

		this._iScroll.refresh(duration);
	};

	// 重置 iScroll
	p._resetScroll = function(width, height) {
		width = width || 0;
		height = height || 0;

		// 重置旋转层
		this._rotationLayerWidth = width;
		this._rotationLayerHeight = height;
		this._rotationLayerX = 0;
		this._rotationLayerY = 0;
		this._curAngle = 0;
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, this._curAngle);

		css(this._$rotationLayer, {
			'width': width,
			'height': height
		});

		this._refreshScroll();

		var iScroll = this._iScroll,
			scale = iScroll.scale,
			posX = (this._clipWidth - width * scale) * .5,
			posY = (this._clipHeight - height * scale) * .5;

		iScroll.scrollTo(posX, posY);
		iScroll.zoom(iScroll.options.startZoom, undefined, undefined, 0);
	};

	p._initRotationEvent = function() {
		if (is_mobile) {
			this._hammerManager = new Hammer.Manager(this._$moveLayer);
			this._hammerManager.add(new Hammer.Rotate());

			var startTouch,
				startAngle,
				curAngle,
				self = this,
				rotateFree = this._options.rotateFree,
				bounceTime = this._iScroll.options.bounceTime;

			this._hammerManager.on('rotatestart', function(e) {
				if (self._atRotation) return;
				startTouch = true;

				if (rotateFree) {
					startAngle = (e.rotation - self._curAngle) % 360;
					self._rotationLayerRotateReady(e.center);
				} else {
					startAngle = e.rotation;
				}
			});

			this._hammerManager.on('rotatemove', function(e) {
				if (!startTouch) return;
				curAngle = e.rotation - startAngle;
				rotateFree && self._rotationLayerRotate(curAngle);
			});

			this._hammerManager.on('rotateend rotatecancel', function(e) {
				if (!startTouch) return;
				startTouch = false;

				if (!rotateFree) {
					curAngle %= 360;
					if (curAngle > 180) curAngle -= 360;
					else if (curAngle < -180) curAngle += 360;

					if (curAngle > 30) {
						self._rotateBy(90, bounceTime, e.center);
					} else if (curAngle < -30) {
						self._rotateBy(-90, bounceTime, e.center);
					}
					return;
				}

				// 接近整90度方向时，进行校正
				var angle = curAngle % 360;
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

				self._rotationLayerRotateFinish(curAngle, bounceTime);
			});
		} else {
			this._$moveLayer.addEventListener('dblclick', this._rotateCW90);
		}
	};

	p._rotateCW90 = function(e) {
		this._rotateBy(90, this._iScroll.options.bounceTime, { x: e.clientX, y: e.clientY });
	};

	p._rotateBy = function(angle, duration, center) {
		this._rotateTo(this._curAngle + angle, duration, center);
	};

	p._rotateTo = function(angle, duration, center) {
		if (this._atRotation) return;

		this._rotationLayerRotateReady(center);

		// 旋转层旋转结束
		this._rotationLayerRotateFinish(angle, duration);
	};

	// 旋转层旋转准备
	p._rotationLayerRotateReady = function(center) {
		var scale = this._iScroll.scale,
			coord; // 旋转参考点在移动层中的坐标

		if (!center) {
			coord = loaclToLoacl(this._$rotationLayer, this._$clipLayer, this._clipWidth * .5, this._clipHeight * .5);
		} else {
			coord = globalToLoacl(this._$rotationLayer, center.x, center.y);
		}

		// 由于得到的坐标是在缩放后坐标系上的坐标，因此需要除以缩放比例
		coord.x /= scale;
		coord.y /= scale;

		// 旋转参考点相对于旋转层零位（旋转层旋转前左上角）的坐标
		var coordBy0 = {
			x: coord.x - this._rotationLayerX,
			y: coord.y - this._rotationLayerY
		};

		// 求出旋转层旋转前的旋转参考点
		// 这个参考点就是旋转中心点映射在旋转层图片上的坐标
		// 这个位置表示旋转层旋转前，该点所对应的坐标
		var origin = pointRotate(coordBy0, -this._curAngle);
		this._rotationLayerOriginX = origin.x;
		this._rotationLayerOriginY = origin.y;

		// 设置参考点，算出新参考点作用下的旋转层位移，然后进行补差
		var rect = this._$rotationLayer.getBoundingClientRect();
		setOrigin(this._$rotationLayer, this._rotationLayerOriginX, this._rotationLayerOriginY);
		var newRect = this._$rotationLayer.getBoundingClientRect();
		this._rotationLayerX += (rect.left - newRect.left) / scale;
		this._rotationLayerY += (rect.top - newRect.top) / scale;
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, this._curAngle);
	};

	// 旋转层旋转
	p._rotationLayerRotate = function(angle) {
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, angle);
		this._curAngle = angle;
	};

	// 旋转层旋转结束
	p._rotationLayerRotateFinish = function(angle, duration) {
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, angle);

		// 获取旋转后的矩形
		var rect = this._$rotationLayer.getBoundingClientRect();

		// 当参考点为零时，获取位移后的矩形
		setOrigin(this._$rotationLayer, 0, 0);
		var rectByOrigin0 = this._$rotationLayer.getBoundingClientRect();

		// 获取旋转前（零度）的矩形
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, 0);
		var rectByAngle0 = this._$rotationLayer.getBoundingClientRect(),

			// 获取移动层的矩形
			moveLayerRect = this._$moveLayer.getBoundingClientRect(),

			// 求出移动层与旋转层之间的位置偏移
			// 由于直接应用在移动层，因此不需要根据缩放换算
			// 注意，这里的偏移有可能还包含缩放过量时多出来的偏移
			offset = {
				x: rect.left - moveLayerRect.left,
				y: rect.top - moveLayerRect.top
			},

			iScroll = this._iScroll,
			scale = iScroll.scale;

		// 更新旋转层当前所呈现矩形的宽高
		this._rotationLayerWidth = rect.width / scale;
		this._rotationLayerHeight = rect.height / scale;
		// 当参考点为零时，旋转层旋转后，在形成的新矩形中，旋转层零位（旋转层旋转前左上角）的新坐标
		this._rotationLayerX = (rectByAngle0.left - rectByOrigin0.left) / scale;
		this._rotationLayerY = (rectByAngle0.top - rectByOrigin0.top) / scale;

		iScroll.scrollTo(
			iScroll.x + offset.x,
			iScroll.y + offset.y
		);
		this._refreshScroll(iScroll.options.bounceTime);

		// 由于双指旋转时也伴随着缩放，因此这里代码执行完后，将会执行 iscroll 的 _zoomEnd
		// 而该方法会基于 touchstart 时记录的位置重新计算 x、y，这将导致手指离开屏幕后，移动层又会向回移动一段距离
		// 所以这里也要将 startX、startY 这两个值进行补差，而这个差值必须是最终的正常比例对应的值
		// 由于 offset 可能还包含缩放过量时多出来的偏移
		// 因此，这里判断是否缩放过量
		var lastScale = Math.max(iScroll.options.zoomMin, Math.min(iScroll.options.zoomMax, scale));
		if (lastScale !== scale) {
			// 当缩放过量时，将 offset 换算为最终的正常比例对应的值
			offset.x = offset.x / scale * lastScale;
			offset.y = offset.y / scale * lastScale;
		}
		iScroll.startX += offset.x;
		iScroll.startY += offset.y;

		if (angle !== this._curAngle && duration && isNumber(duration) && supportTransition !== undefined) {
			// 计算旋转层参考点，设为零位前后的偏移量
			offset = {
				x: (rectByOrigin0.left - rect.left) / scale,
				y: (rectByOrigin0.top - rect.top) / scale
			};
			// 将旋转参考点设回前值，同时调整偏移量，保证视图位置不变，准备开始动画
			setOrigin(this._$rotationLayer, this._rotationLayerOriginX, this._rotationLayerOriginY);
			setTransform(this._$rotationLayer, this._rotationLayerX + offset.x, this._rotationLayerY + offset.y, this._curAngle);

			// 开始旋转
			var self = this;
			this._atRotation = true;
			setTransition(this._$rotationLayer, this._rotationLayerX + offset.x, this._rotationLayerY + offset.y, angle, duration, function() {
				self._atRotation = false;
				self._rotateFinishUpdataElem(angle);
			});
		} else {
			this._rotateFinishUpdataElem(angle);
		}
	};

	// 旋转结束更新相关元素
	p._rotateFinishUpdataElem = function(angle) {
		setOrigin(this._$rotationLayer, this._rotationLayerOriginX = 0, this._rotationLayerOriginY = 0);
		setTransform(this._$rotationLayer, this._rotationLayerX, this._rotationLayerY, this._curAngle = angle % 360);
	};

	p._initFile = function() {
		var self = this,
			options = this._options,
			errorMsg = options.errorMsg;

		if (this._fileList = $(options.file)) {
			this._fileList.forEach(function($file) {
				// 移动端如果设置 'accept'，会使相册打开缓慢，因此这里只为非移动端设置
				if (!is_mobile) {
					attr($file, 'accept', 'image/jpeg, image/x-png, image/gif');
				}

				$file.addEventListener('change', self._fileOnChangeHandle);
			});
		}
	};

	p._fileOnChangeHandle = function(e) {
		var files = e.target.files;

		if (files.length) {
			this._lrzHandle(files[0]);
		}
	};

	p._lrzHandle = function(src) {
		var self = this,
			options = this._options,
			errorMsg = options.errorMsg;

		if (typeof src === 'object' && src.type && !/image\/\w+/.test(src.type)) {
			options.loadError.call(this, errorMsg.imgError);
			return false;
		}

		this._imgLoaded = false;
		this._imgLoading = true;
		options.loadStart.call(this, src);

		try {
			lrz(src, options.lrzOption)
			.then(function (rst) {
				// 处理成功会执行
				self._clearImg();
				self._createImg(rst.base64);
			})
			.catch(function (err) {
				// 处理失败会执行
				options.loadError.call(self, errorMsg.imgHandleError, err);
				self._imgLoading = false;
			});
		} catch(err) {
			throw err;
			options.loadError.call(self, errorMsg.imgHandleError, err);
			self._imgLoading = false;
		}
	};

	p._clearImg = function() {
		if (!this._$img) return;

		// 删除旧的图片以释放内存，防止IOS设备的 webview 崩溃
		this._$img.onload = null;
		this._$img.onerror = null;
		removeElement(this._$img);
		this._$img = null;
	};

	p._createImg = function(src) {
		var self = this,
			options = this._options,
			errorMsg = options.errorMsg;

		this._$img = new Image();

		css(this._$img, {
			'user-select': 'none',
			'pointer-events': 'none'
		});

		this._$img.onload = function() {
			self._imgLoaded = true;
			self._imgLoading = false;
			options.loadComplete.call(self, this);

			self._$rotationLayer.appendChild(this);

			hideAction([this, self._$moveLayer], function() {
				self._resetScroll(this.naturalWidth, this.naturalHeight);
			}, this);
		};

		this._$img.onerror = function(e) {
			options.loadError.call(self, errorMsg.imgLoadError, e);
			self._imgLoading = false;
		}

		attr(this._$img, 'src', src);
	};

	p._clipImg = function() {
		var options = this._options,
			errorMsg = options.errorMsg;

		if (!this._imgLoaded) {
			options.fail.call(this, errorMsg.noImg);
			return;
		}

		var local = loaclToLoacl(this._$rotationLayer, this._$clipLayer),
			scale = this._iScroll.scale,
			scaleX = 1,
			scaleY = 1,
			ctx = this._canvas.getContext('2d');

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
		ctx.fillStyle = options.style.jpgFillColor;
		ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
		ctx.save();

		ctx.scale(scaleX, scaleY);
		ctx.translate(this._rotationLayerX - local.x / scale, this._rotationLayerY - local.y / scale);
		ctx.rotate(this._curAngle * Math.PI / 180);

		ctx.drawImage(this._$img, 0, 0);
		ctx.restore();

		try {
			var dataURL = this._canvas.toDataURL(options.outputType, options.outputQuality);
			if (this._viewList) {
				this._viewList.forEach(function($view, i) {
					css($view, 'background-image', 'url('+ dataURL +')');
				});
			}
			options.done.call(this, dataURL);
			return dataURL;
		} catch(e) {
			options.fail.call(this, errorMsg.clipError, e);
		}
	};

	p._resize = function(width, height) {
		hideAction(this._$container, function() {
			this._containerWidth = this._$container.offsetWidth;
			this._containerHeight = this._$container.offsetHeight;
		}, this);

		var size = this._options.size,
			oldClipWidth = this._clipWidth,
			oldClipHeight = this._clipHeight;

		if (isNumber(width)) size[0] = width;
		if (isNumber(height)) size[1] = height;

		if (this._widthIsPercent || this._heightIsPercent) {
			var ratio = size[0] / size[1];

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

		var clipWidth = this._clipWidth,
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
			this._refreshScroll();

			var iScroll = this._iScroll,
				scale = iScroll.scale,
				offsetX = (clipWidth - oldClipWidth) * .5 * scale,
				offsetY = (clipHeight - oldClipHeight) * .5 * scale;
			iScroll.scrollBy(offsetX, offsetY);

			var lastScale = Math.max(iScroll.options.zoomMin, Math.min(iScroll.options.zoomMax, scale));
			if (lastScale !== scale) {
				iScroll.zoom(lastScale, undefined, undefined, 0);
			}
		}
	};

	p._initProxy = function() {
		// 生成回调代理
		this._fileOnChangeHandle = proxy(this, '_fileOnChangeHandle');
		this._rotateCW90 = proxy(this, '_rotateCW90');
		this._resize = proxy(this, '_resize');
		this._clipImg = proxy(this, '_clipImg');

		// 确保对外接口函数，无论持有者是谁，调用都不会出错
		this.size = proxy(this, 'size');
		this.load = proxy(this, 'load');
		this.rotateBy = proxy(this, 'rotateBy');
		this.rotateTo = proxy(this, 'rotateTo');
		this.clip = proxy(this, 'clip');
		this.destroy = proxy(this, 'destroy');
	};

	/**
	 * 设置截取框的宽高
	 * 如果设置了 adaptive 选项，则该方法仅用于修改截取框的宽高比例
	 * @param  {Number} width  截取框的宽度
	 * @param  {Number} height 截取框的高度
	 * @return {PhotoClip}     返回 PhotoClip 的实例对象
	 */
	p.size = function(width, height) {
		this._resize(width, height);
		return this;
	};

	/**
	 * 加载一张图片
	 * @param  {String|Object} src 图片的 url，或者图片的 file 文件对象
	 * @return {PhotoClip}         返回 PhotoClip 的实例对象
	 */
	p.load = function(src) {
		this._lrzHandle(src);
		return this;
	};

	/**
	 * 清除当前图片
	 * @return {PhotoClip}  返回 PhotoClip 的实例对象
	 */
	p.clear = function() {
		this._clearImg();
		this._resetScroll();
		if (this._fileList) {
			this._fileList.forEach(function($file) {
				$file.value = '';
			});
		}
		return this;
	};

	/**
	 * 图片旋转到指定角度
	 * @param  {Number} angle      可选。旋转的角度
	 * @param  {Number} duration   可选。旋转动画的时长，如果为 0 或 false，则表示没有过渡动画
	 * @return {PhotoClip|Number}  返回 PhotoClip 的实例对象。如果参数为空，则返回当前的旋转角度
	 */
	p.rotate = function(angle, duration) {
		if (angle === undefined) return this._curAngle;
		this._rotateTo(angle, duration);
		return this;
	};

	/**
	 * 图片缩放到指定比例，如果超出缩放范围，则会被缩放到可缩放极限
	 * @param  {Number} zoom       可选。缩放比例，取值在 0 - 1 之间
	 * @param  {Number} duration   可选。缩放动画的时长，如果为 0 或 false，则表示没有过渡动画
	 * @return {PhotoClip|Number}  返回 PhotoClip 的实例对象。如果参数为空，则返回当前的缩放比例
	 */
	p.scale = function(zoom, duration) {
		if (zoom === undefined) return this._iScroll.scale;
		this._iScroll.zoom(zoom, undefined, undefined, duration);
		return this;
	};

	/**
	 * 截图
	 * @return {String}  返回截取后图片的 Base64 字符串
	 */
	p.clip = function() {
		return this._clipImg();
	};

	/**
	 * 销毁
	 * @return {Undefined}  无返回值
	 */
	p.destroy = function() {
		var self = this;

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
			this._viewList.forEach(function($view, i) {
				css($view, self._viewOriginStyleList[i]);
			});
		}

		if (this._fileList) {
			this._fileList.forEach(function($file) {
				$file.removeEventListener('change', self._fileOnChangeHandle);
			});
		}

		if (this._okList) {
			this._okList.forEach(function($ok) {
				$ok.removeEventListener('click', self._clipImg);
			});
		}

		// 清除所有属性
		for (var p in this) {
			delete this[p];
		}

		this.__proto__ = Object.prototype;
	};

	// 获取最大缩放比例
	function getScale(w1, h1, w2, h2) {
		var sx = w1 / w2;
		var sy = h1 / h2;
		return sx > sy ? sx : sy;
	}

	function setOrigin($obj, originX, originY) {
		originX = (originX || 0).toFixed(2);
		originY = (originY || 0).toFixed(2);
		css($obj, prefix + 'transform-origin', originX + 'px ' + originY + 'px');
	}

	function setTransform($obj, x, y, angle) {
		// translate(x, y) 中坐标的小数点位数过多会引发 bug
		// 因此这里需要保留两位小数
		x = x.toFixed(2);
		y = y.toFixed(2);
		angle = angle.toFixed(2);

		css($obj, prefix + 'transform', 'translateZ(0) translate(' + x + 'px,' + y + 'px) rotate(' + angle + 'deg)');
	}

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

	// 计算一个点绕原点旋转后的新坐标
	function pointRotate(point, angle) {
		var radian = angleToRadian(angle),
			sin = Math.sin(radian),
			cos = Math.cos(radian);
		return {
			x: cos * point.x - sin * point.y,
			y: cos * point.y + sin * point.x
		};
	}

	// 角度转弧度
	function angleToRadian(angle) {
		return angle / 180 * Math.PI;
	}

	// 计算layerTwo上的x、y坐标在layerOne上的坐标
	function loaclToLoacl(layerOne, layerTwo, x, y) {
		x = x || 0;
		y = y || 0;
		var layerOneRect, layerTwoRect;
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
	function globalToLoacl(layer, x, y) {
		x = x || 0;
		y = y || 0;
		var layerRect;
		hideAction(layer, function() {
			layerRect = layer.getBoundingClientRect();
		});
		return {
			x: x - layerRect.left,
			y: y - layerRect.top
		};
	}

	function extend() {
		var options, name, src, copy, copyIsArray,
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
	var guid = 0;
	function proxy(func, target) {
		if (typeof target === 'string') {
			var tmp = func[target];
			target = func;
			func = tmp;
		}

		if (typeof func !== 'function') {
			return undefined;
		}

		var slice = Array.prototype.slice,
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
	var defaultDisplayMap = {};
	function hideAction(elems, func, target) {
		if (typeof elems !== 'object') {
			elems = [];
		}

		if (typeof elems.length === 'undefined') {
			elems = [elems];
		}

		var hideElems = [],
			hideElemsDisplay = [];

		for (var i = 0, elem; elem = elems[i++];) {

			while (elem instanceof HTMLElement) {

				var nodeName = elem.nodeName;

				if (!elem.getClientRects().length) {
					hideElems.push(elem);
					hideElemsDisplay.push(elem.style.display);

					var display = defaultDisplayMap[nodeName];
					if (!display) {
						var temp = document.createElement(nodeName);
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

		var l = hideElems.length;
		while (l--) {
			hideElems.pop().style.display = hideElemsDisplay.pop();
		}
	}

	// 判断是否为百分比
	function isPercent(value) {
		return /%$/.test(value + '');
	}

	// 判断对象是否为数字
	function isNumber(obj) {
		return typeof obj === 'number';
	}

	// 判断对象是否为数组
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	// 类似数组对象转数组
	function toArray(obj) {
		return Array.prototype.map.call(obj, function(n) { return n });
	}

	// 创建元素
	function createElement(parentNode, className, id, prop) {
		var elem = document.createElement('DIV');

		if (typeof className === 'object') {
			prop = className;
			className = null;
		}

		if (typeof id === 'object') {
			prop = id;
			id = null;
		}

		if (typeof prop === 'object') {
			for (var p in prop) {
				elem.style[p] = prop[p];
			}
		}

		if (className) elem.className = className;
		if (id) elem.id = id;

		parentNode.appendChild(elem);

		return elem;
	}

	// 移除元素
	function removeElement(elem) {
		elem.parentNode && elem.parentNode.removeChild(elem);
	}

	// 获取元素（IE8及以上浏览器）
	function $(selector, context) {
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
	function attr(elem, prop, value) {
		if (typeof prop === 'object') {
			for (var p in prop) {
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
	function css(elem, prop, value) {
		if (typeof prop === 'object') {
			for (var p in prop) {
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

	function support(prop) {
		var testElem = document.documentElement;
		if (prop in testElem.style) return '';

		var testProp = prop.charAt(0).toUpperCase() + prop.substr(1),
			prefixs = [ 'Webkit', 'Moz', 'ms', 'O' ];

		for (var i = 0, prefix; prefix = prefixs[i++];) {
			if ((prefix + testProp) in testElem.style) {
				return '-' + prefix.toLowerCase() + '-';
			}
		}
	}

	return PhotoClip;
}));

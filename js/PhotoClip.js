/**
 * PhotoClip v2.0.3
 * 依赖插件
 * - jquery.js
 * - iscroll-zoom.js
 * - hammer.js
 * - lrz.all.bundle.js
 *
 * @author 白俊杰 625603381@qq.com 2014/07/31
 * https://github.com/baijunjie/PhotoClip.js
 *
 * @brief	支持手势的裁图插件
 *			在移动设备上双指捏合为缩放，双指旋转可根据旋转方向每次旋转90度
 *			在PC设备上鼠标滚轮为缩放，每次双击则顺时针旋转90度
 * @option_param    {array}    size          截取框宽和高组成的数组。默认值为[260,260]
 * @option_param    {array}    adaptive      截取框自适应，截取框宽和高的百分比组成的数组。默认为 null。如果设置了该参数，且值有效，则会忽略 size 的大小设置，size 中的值仅用于计算宽高比。当设置了其中一个值得百分比时，如果另一个未设置，则将会按 size 中的比例等比缩放。
 * @option_param    {array}    outputSize    输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
 * @option_param    {string}   outputType    指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
 * @option_param    {string}   outputQuality 输出质量，取值 0 - 1，默认为0.8。（这个质量不是最终输出的质量，与 lrzOption.quality 是相乘关系）
 * @option_param    {string}   file          上传图片的<input type="file">控件的选择器或者DOM对象
 * @option_param    {string}   source        需要裁剪图片的url地址。该参数表示当前立即开始裁剪的图片，不需要使用 file 控件获取。注意，该参数不支持跨域图片。
 * @option_param    {string}   view          显示截取后图像的容器的选择器或者DOM对象
 * @option_param    {string}   ok            确认截图按钮的选择器或者DOM对象
 * @option_param    {function} loadStart     开始加载的回调函数。this指向当前 PhotoClip 的实例对象，并将正在加载的 file 对象作为参数传入（如果是使用 source 加载图片，则该参数为图片的 img 对象）
 * @option_param    {function} loadComplete  加载完成的回调函数。this指向当前 PhotoClip 的实例对象，并将图片的 img 对象作为参数传入
 * @option_param    {function} loadError     加载失败的回调函数。this指向当前 PhotoClip 的实例对象，并将错误事件的 event 对象作为参数传入
 * @option_param    {function} clipFinish    裁剪完成的回调函数。this指向当前 PhotoClip 的实例对象，会将裁剪出的图像数据DataURL作为参数传入
 * @option_param    {object}   lrzOption     lrz压缩插件的配置参数
 * @lrzOption_param {Number}   width         图片最大不超过的宽度，默认为原图宽度，高度不设时会适应宽度。
 * @lrzOption_param {Number}   height        图片最大不超过的高度，默认为原图高度，宽度不设时会适应高度。
 * @lrzOption_param {Number}   quality       图片压缩质量，取值 0 - 1，默认为0.7。（这个质量不是最终输出的质量，与 outputQuality 是相乘关系）
 */

(function(root, factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(["jquery", "iscroll-zoom", "hammer", "lrz"], factory);
	} else if (typeof exports === "object") {
		module.exports = factory(require("jquery"), require("iscroll-zoom"), require("hammer"), require("lrz"));
	} else {
		root.PhotoClip = factory(root.jQuery, root.IScroll, root.Hammer, root.lrz);
	}

}(this, function($, IScroll, Hammer, lrz) {
	"use strict";

	var defaultOption = {
		size: [260, 260],
		adaptive: null,
		outputSize: [0, 0],
		outputType: "jpg",
		outputQuality: .8,
		file: "",
		source: "",
		view: "",
		ok: "",
		loadStart: function() {},
		loadComplete: function() {},
		loadError: function() {},
		clipFinish: function() {},
		lrzOption: {}
	}

	function PhotoClip(container, option) {
		var opt = $.extend({}, defaultOption, option);
		photoClip.call(this, container, opt);
	}

	function photoClip(container, option) {
		var self = this,

			size = option.size,
			adaptive = option.adaptive,
			outputSize = option.outputSize,
			outputType = option.outputType || "image/jpeg",
			outputQuality = option.outputQuality,
			file = option.file,
			source = option.source,
			view = option.view,
			ok = option.ok,
			loadStart = option.loadStart,
			loadComplete = option.loadComplete,
			loadError = option.loadError,
			clipFinish = option.clipFinish,
			lrzOption = option.lrzOption;

		if (!$.isArray(size)) {
			size = [260, 260];
		}

		if (!$.isArray(outputSize)) {
			outputSize = [0, 0];
		}

		var originWidth = size[0] || 260,
			originHeight = size[1] || 260,
			outputWidth = Math.max(outputSize[0], 0),
			outputHeight = Math.max(outputSize[1], 0),
			widthIsPercent,
			heightIsPercent,
			ratio,
			clipWidth,
			clipHeight;

		if ($.isArray(adaptive)) {
			if (adaptive[0]) widthIsPercent = isPercent(adaptive[0]) ? adaptive[0] : false;
			if (adaptive[1]) heightIsPercent = isPercent(adaptive[1]) ? adaptive[1] : false;
		}

		if (outputType === "jpg") {
			outputType = "image/jpeg";
		} else if (outputType === "png") {
			outputType = "image/png";
		}

		var loading = false;
		if (file) {
			if (!window.FileReader) {
				alert("您的浏览器不支持 HTML5 的 FileReader API，因此不能使用 file 控件上传图片！");
			} else {
				var $file = $(file);
				if ($file.length) {
					$file.attr("accept", "image/jpeg, image/x-png, image/gif");

					$file.on("change", function() {
						if (!this.files.length) return;
						var files = this.files[0];
						if (!/image\/\w+/.test(files.type)) {
							console.log("图片格式不正确，请选择正确格式的图片文件！");
							loadError.call(self, "Image format error");
							return false;
						} else {
							if (!loading) {
								loading = true;
								loadStart.call(self, files);
							}

							var fileReader = new FileReader();
							fileReader.onprogress = function(e) {
								console.log((e.loaded / e.total * 100).toFixed() + "%");
							};
							fileReader.onload = function(e) {
								lrz(files, lrzOption)
								.then(function (rst) {
									// 处理成功会执行
									createImg(rst.base64);
									loading = false;
								})
								.catch(function (err) {
									// 处理失败会执行
									console.log("图片处理失败");
									loadError.call(self, err);
									loading = false;
								});
							};
							fileReader.onerror = function(e) {
								console.log("图片加载失败");
								loadError.call(self, e);
								loading = false;
							};
							fileReader.readAsDataURL(files); // 读取文件内容
						}
					});

					$file.click(function() {
						this.value = "";
					});
				}
			}
		}

		if (source) {
			setImg(source);
		}

		var $img,
			imgWidth, imgHeight, //图片原始的宽高
			curImgWidth, curImgHeight, // 旋转层当前方向上图片的宽高
			imgLoaded; //图片是否已经加载完成

		var $container, // 容器，包含裁剪视图层和遮罩层
			$clipView, // 裁剪视图层，包含移动层
			$moveLayer, // 移动层，包含旋转层
			$rotateLayer, // 旋转层
			$view, // 最终截图后呈现的视图容器

			$mask_left,
			$mask_right,
			$mask_top,
			$mask_bottom,
			$mask_area,
			$clip_area,

			canvas, // 图片裁剪用到的画布
			hammerManager,
			myScroll, // 图片的scroll对象，包含图片的位置与缩放信息
			containerWidth, containerHeight;

		init();
		initScroll();
		initEvent();
		initClip();

		var $ok = $(ok);
		if ($ok.length) {
			$ok.click(function() {
				clipImg();
			});
		}

		var $win = $(window);
		resize();
		$win.resize(resize);

		var atRotation, // 是否正在旋转中
			curX, // 旋转层的当前X坐标
			curY, // 旋转层的当前Y坐标
			curAngle; // 旋转层的当前角度

		function imgLoad() {
			imgLoaded = true;

			$rotateLayer.append(this);

			hideAction($img, function() {
				imgWidth = this.naturalWidth;
				imgHeight = this.naturalHeight;
			}, this);

			hideAction($moveLayer, function() {
				resetScroll();
			});

			loadComplete.call(self, this);
		}

		function initScroll() {
			var options = {
				zoom: true,
				scrollX: true,
				scrollY: true,
				freeScroll: true,
				mouseWheel: true,
				wheelAction: "zoom"
			}
			myScroll = new IScroll($clipView[0], options);
		}

		function resetScroll() {
			curX = 0;
			curY = 0;
			curAngle = 0;
			curImgWidth = imgWidth;
			curImgHeight = imgHeight;

			$rotateLayer.css({
				"width": imgWidth,
				"height": imgHeight
			});
			setTransform($rotateLayer, curX, curY, curAngle);

			refreshScroll(imgWidth, imgHeight);
			myScroll.zoom(myScroll.options.zoomStart);

			var posX = (clipWidth - imgWidth * myScroll.scale) * .5,
				posY = (clipHeight - imgHeight * myScroll.scale) * .5;
			myScroll.scrollTo(posX, posY);
		}

		function refreshScroll(width, height) {
			calculateScale(width, height);
			if (myScroll.scale < myScroll.options.zoomMin) {
				myScroll.zoom(myScroll.options.zoomMin);
			}

			$moveLayer.css({
				"width": width,
				"height": height
			});
			// 在移动设备上，尤其是Android设备，当为一个元素重置了宽高时
			// 该元素的offsetWidth/offsetHeight、clientWidth/clientHeight等属性并不会立即更新，导致相关的js程序出现错误
			// iscroll 在刷新方法中正是使用了 offsetWidth/offsetHeight 来获取scroller元素($moveLayer)的宽高
			// 因此需要手动将元素重新添加进文档，迫使浏览器强制更新元素的宽高
			$clipView.append($moveLayer);
			myScroll.refresh();
		}

		function initEvent() {
			var is_mobile = !!navigator.userAgent.match(/mobile/i);

			if (is_mobile) {
				hammerManager = new Hammer($moveLayer[0]);
				hammerManager.add(new Hammer.Rotate());

				var rotation, rotateDirection;
				hammerManager.on("rotatemove", function(e) {
					if (atRotation) return;
					rotation = e.rotation;
					if (rotation > 180) {
						rotation -= 360;
					} else if (rotation < -180) {
						rotation += 360  ;
					}
					rotateDirection = rotation > 0 ? 1 : rotation < 0 ? -1 : 0;
				});
				hammerManager.on("rotateend", function(e) {
					if (atRotation) return;

					if (Math.abs(rotation) > 30) {
						if (rotateDirection == 1) {
							// 顺时针
							rotateCW(e.center);
						} else if (rotateDirection == -1) {
							// 逆时针
							rotateCCW(e.center);
						}
					}
				});
			} else {
				$moveLayer.on("dblclick", function(e) {
					rotateCW({
						x: e.clientX,
						y: e.clientY
					});
				});
			}
		}

		function rotateCW(point) {
			rotateBy(90, point);
		}

		function rotateCCW(point) {
			rotateBy(-90, point);
		}

		function rotateBy(angle, point) {
			if (atRotation) return;
			atRotation = true;

			var loacl;
			if (!point) {
				loacl = loaclToLoacl($moveLayer, $clipView, clipWidth * .5, clipHeight * .5);
			} else {
				loacl = globalToLoacl($moveLayer, point.x, point.y);
			}
			var origin = calculateOrigin(curAngle, loacl), // 旋转中使用的参考点坐标
				originX = origin.x,
				originY = origin.y,

				// 旋转层以零位为参考点旋转到新角度后的位置，与以当前计算的参考点“从零度”旋转到新角度后的位置，之间的左上角偏移量
				offsetX = 0, offsetY = 0,
				// 移动层当前的位置（即旋转层旋转前的位置），与旋转层以当前计算的参考点从当前角度旋转到新角度后的位置，之间的左上角偏移量
				parentOffsetX = 0, parentOffsetY = 0,

				newAngle = curAngle + angle;


			if (newAngle == 90 || newAngle == -270)
			{
				offsetX = originX + originY;
				offsetY = originY - originX;

				if (newAngle > curAngle) {
					parentOffsetX = imgHeight - originX - originY;
					parentOffsetY = originX - originY;
				} else if (newAngle < curAngle) {
					parentOffsetX = (imgHeight - originY) - (imgWidth - originX);
					parentOffsetY = originX + originY - imgHeight;
				}

				curImgWidth = imgHeight;
				curImgHeight = imgWidth;
			}
			else if (newAngle == 180 || newAngle == -180)
			{
				offsetX = originX * 2;
				offsetY = originY * 2;

				if (newAngle > curAngle) {
					parentOffsetX = (imgWidth - originX) - (imgHeight - originY);
					parentOffsetY = imgHeight - (originX + originY);
				} else if (newAngle < curAngle) {
					parentOffsetX = imgWidth - (originX + originY);
					parentOffsetY = (imgHeight - originY) - (imgWidth - originX);
				}

				curImgWidth = imgWidth;
				curImgHeight = imgHeight;
			}
			else if (newAngle == 270 || newAngle == -90)
			{
				offsetX = originX - originY;
				offsetY = originX + originY;

				if (newAngle > curAngle) {
					parentOffsetX = originX + originY - imgWidth;
					parentOffsetY = (imgWidth - originX) - (imgHeight - originY);
				} else if (newAngle < curAngle) {
					parentOffsetX = originY - originX;
					parentOffsetY = imgWidth - originX - originY;
				}

				curImgWidth = imgHeight;
				curImgHeight = imgWidth;
			}
			else if (newAngle == 0 || newAngle == 360 || newAngle == -360)
			{
				offsetX = 0;
				offsetY = 0;

				if (newAngle > curAngle) {
					parentOffsetX = originX - originY;
					parentOffsetY = originX + originY - imgWidth;
				} else if (newAngle < curAngle) {
					parentOffsetX = originX + originY - imgHeight;
					parentOffsetY = originY - originX;
				}

				curImgWidth = imgWidth;
				curImgHeight = imgHeight;
			}

			// 将触摸点设为旋转时的参考点
			// 改变参考点的同时，要计算坐标的偏移，从而保证图片位置不发生变化
			if (curAngle == 0) {
				curX = 0;
				curY = 0;
			} else if (curAngle == 90 || curAngle == -270) {
				curX -= originX + originY;
				curY -= originY - originX;
			} else if (curAngle == 180 || curAngle == -180) {
				curX -= originX * 2;
				curY -= originY * 2;
			} else if (curAngle == 270 || curAngle == -90) {
				curX -= originX - originY;
				curY -= originX + originY;
			}
			curX = curX.toFixed(2) - 0;
			curY = curY.toFixed(2) - 0;
			setTransform($rotateLayer, curX, curY, curAngle, originX, originY);

			// 开始旋转
			setTransition($rotateLayer, curX, curY, newAngle, 200, function() {
				atRotation = false;
				curAngle = newAngle % 360;
				// 旋转完成后将参考点设回零位
				// 同时加上偏移，保证图片位置看上去没有变化
				// 这里要另外要加上父容器（移动层）零位与自身之间的偏移量
				curX += offsetX + parentOffsetX;
				curY += offsetY + parentOffsetY;
				curX = curX.toFixed(2) - 0;
				curY = curY.toFixed(2) - 0;
				setTransform($rotateLayer, curX, curY, curAngle);
				// 相应的父容器（移动层）要减去与旋转层之间的偏移量
				// 这样看上去就好像图片没有移动
				myScroll.scrollTo(
					myScroll.x - parentOffsetX * myScroll.scale,
					myScroll.y - parentOffsetY * myScroll.scale
				);

				refreshScroll(curImgWidth, curImgHeight);
			});
		}

		function initClip() {
			canvas = document.createElement("canvas");
		}

		function clipImg() {
			if (!imgLoaded) {
				console.log("当前没有图片可以裁剪!");
				clipFinish.call(self, null);
				return;
			}
			var local = loaclToLoacl($moveLayer, $clipView);
			var scale = myScroll.scale;
			var ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();

			if (!outputWidth || !outputHeight) {
				canvas.width = clipWidth / scale;
				canvas.height = clipHeight / scale;
			} else {
				canvas.width = outputWidth;
				canvas.height = outputHeight;
				ctx.scale(outputWidth / clipWidth * scale, outputHeight / clipHeight * scale);
			}

			ctx.translate(curX - local.x / scale, curY - local.y / scale);
			ctx.rotate(curAngle * Math.PI / 180);

			ctx.drawImage($img[0], 0, 0);
			ctx.restore();

			try {
				var dataURL = canvas.toDataURL(outputType, outputQuality);
				$view.css("background-image", "url("+ dataURL +")");
				clipFinish.call(self, dataURL);
			} catch(e) {
				throw new Error("截图失败！当前图片源文件可能存在跨域问题，请确保图片与应用同源。如果您是在本地环境下执行本程序，请更换至服务器环境。");
			}
		}

		function resize() {
			setSize();
		}

		function loaclToLoacl($layerOne, $layerTwo, x, y) { // 计算$layerTwo上的x、y坐标在$layerOne上的坐标
			x = x || 0;
			y = y || 0;
			var layerOneOffset, layerTwoOffset;
			hideAction($layerOne, function() {
				layerOneOffset = $layerOne.offset();
			});
			hideAction($layerTwo, function() {
				layerTwoOffset = $layerTwo.offset();
			});
			return {
				x: layerTwoOffset.left - layerOneOffset.left + x,
				y: layerTwoOffset.top - layerOneOffset.top + y
			};
		}

		function globalToLoacl($layer, x, y) { // 计算相对于窗口的x、y坐标在$layer上的坐标
			x = x || 0;
			y = y || 0;
			var layerOffset;
			hideAction($layer, function() {
				layerOffset = $layer.offset();
			});
			return {
				x: x + $win.scrollLeft() - layerOffset.left,
				y: y + $win.scrollTop() - layerOffset.top
			};
		}

		function hideAction(jq, func, target) {
			var $hide = $();
			$.each(jq, function(i, n){
				var $n = (n instanceof jQuery) ? n : $(n),
					$hidden = $n.parents().addBack().filter(":hidden"),
					$none,
					i = $hidden.length;
				while (i--) {
					if (!$n.is(":hidden")) break;
					$none = $hidden.eq(i);
					if ($none.css("display") === "none") $hide = $hide.add($none.show());
				}
			});
			if (typeof(func) === "function") func.call(target || this);
			$hide.hide();
		}

		function calculateOrigin(curAngle, point) {
			var scale = myScroll.scale;
			var origin = {};
			if (curAngle == 0) {
				origin.x = point.x / scale;
				origin.y = point.y / scale;
			} else if (curAngle == 90 || curAngle == -270) {
				origin.x = point.y / scale;
				origin.y = imgHeight - point.x / scale;
			} else if (curAngle == 180 || curAngle == -180) {
				origin.x = imgWidth - point.x / scale;
				origin.y = imgHeight - point.y / scale;
			} else if (curAngle == 270 || curAngle == -90) {
				origin.x = imgWidth - point.y / scale;
				origin.y = point.x / scale;
			}
			return origin;
		}

		function getScale(w1, h1, w2, h2) {
			var sx = w1 / w2;
			var sy = h1 / h2;
			return sx > sy ? sx : sy;
		}

		function calculateScale(width, height) {
			myScroll.options.zoomMin = getScale(clipWidth, clipHeight, width, height);
			myScroll.options.zoomMax = Math.max(1, myScroll.options.zoomMin);
			myScroll.options.zoomStart = Math.min(myScroll.options.zoomMax, getScale(containerWidth, containerHeight, width, height));
		}

		function clearImg() {
			if ($img &&　$img.length) {
				// 删除旧的图片以释放内存，防止IOS设备的webview崩溃
				$img.off();
				$img.remove();
				delete $img[0];
			}
		}

		function createImg(src) {
			clearImg();
			$img = $("<img>").css({
				"user-select": "none",
				"pointer-events": "none"
			});

			if (!loading) {
				loading = true;
				loadStart.call(self, $img[0]);
			}

			$img.on('load', imgLoad);
			$img.attr("src", src);
		}

		function setTransform($obj, x, y, angle, originX, originY) {
			originX = originX || 0;
			originY = originY || 0;
			var style = {};
			style[prefix + "transform"] = "translateZ(0) translate(" + x + "px," + y + "px) rotate(" + angle + "deg)";
			style[prefix + "transform-origin"] = originX + "px " + originY + "px";
			$obj.css(style);
		}

		function setTransition($obj, x, y, angle, dur, fn) {
			// 这里需要先读取之前设置好的transform样式，强制浏览器将该样式值渲染到元素
			// 否则浏览器可能出于性能考虑，将暂缓样式渲染，等到之后所有样式设置完成后再统一渲染
			// 这样就会导致之前设置的位移也被应用到动画中
			$obj.css(prefix + "transform");
			$obj.css(prefix + "transition", prefix + "transform " + dur + "ms");
			$obj.one(transitionEnd, function() {
				$obj.css(prefix + "transition", "");
				fn.call(this);
			});
			$obj.css(prefix + "transform", "translateZ(0) translate(" + x + "px," + y + "px) rotate(" + angle + "deg)");
		}

		// 判断是否为百分比
		function isPercent(value) {
			var str = value + "";
			return /%$/.test(str);
		};

		function init() {
			// 初始化容器
			$container = $(container).css({
				"user-select": "none",
				"overflow": "hidden"
			});
			if ($container.css("position") == "static") $container.css("position", "relative");

			// 创建裁剪视图层
			$clipView = $("<div class='photo-clip-view'>").css({
				"position": "absolute",
				"left": "50%",
				"top": "50%"
			}).appendTo($container);

			$moveLayer = $("<div class='photo-clip-moveLayer'>").appendTo($clipView);

			$rotateLayer = $("<div class='photo-clip-rotateLayer'>").appendTo($moveLayer);

			// 创建遮罩
			var $mask = $("<div class='photo-clip-mask'>").css({
				"position": "absolute",
				"left": 0,
				"top": 0,
				"width": "100%",
				"height": "100%",
				"pointer-events": "none"
			}).appendTo($container);
			$mask_left = $("<div class='photo-clip-mask-left'>").css({
				"position": "absolute",
				"left": 0,
				"right": "50%",
				"top": "50%",
				"bottom": "50%",
				"width": "auto",
				"background-color": "rgba(0,0,0,.5)"
			}).appendTo($mask);
			$mask_right = $("<div class='photo-clip-mask-right'>").css({
				"position": "absolute",
				"left": "50%",
				"right": 0,
				"top": "50%",
				"bottom": "50%",
				"background-color": "rgba(0,0,0,.5)"
			}).appendTo($mask);
			$mask_top = $("<div class='photo-clip-mask-top'>").css({
				"position": "absolute",
				"left": 0,
				"right": 0,
				"top": 0,
				"bottom": "50%",
				"background-color": "rgba(0,0,0,.5)"
			}).appendTo($mask);
			$mask_bottom = $("<div class='photo-clip-mask-bottom'>").css({
				"position": "absolute",
				"left": 0,
				"right": 0,
				"top": "50%",
				"bottom": 0,
				"background-color": "rgba(0,0,0,.5)"
			}).appendTo($mask);
			// 创建截取区域
			$clip_area = $("<div class='photo-clip-area'>").css({
				"border": "1px dashed #ddd",
				"position": "absolute",
				"left": "50%",
				"top": "50%"
			}).appendTo($mask);

			// 初始化视图容器
			$view = $(view);
			if ($view.length) {
				$view.css({
					"background-color": "#666",
					"background-repeat": "no-repeat",
					"background-position": "center",
					"background-size": "contain"
				});
			}
		}

		function setSize(width, height) {
			var oldWidth = originWidth,
				oldHeight = originHeight;

			if (typeof width === "number") originWidth = width;
			if (typeof height === "number") originHeight = height;
			clipWidth = originWidth;
			clipHeight = originHeight;

			if (widthIsPercent || heightIsPercent) {
				ratio = originWidth / originHeight;
			}

			hideAction($container, function() {
				containerWidth = $container.width();
				containerHeight = $container.height();
			});

			if (widthIsPercent) {
				clipWidth = containerWidth / 100 * parseFloat(widthIsPercent);
				if (!heightIsPercent) {
					clipHeight = clipWidth / ratio;
				}
			}
			if (heightIsPercent) {
				clipHeight = containerHeight / 100 * parseFloat(heightIsPercent);
				if (!widthIsPercent) {
					clipWidth = clipHeight * ratio;
				}
			}

			$clipView.css({
				"width": clipWidth,
				"height": clipHeight,
				"margin-left": -clipWidth/2,
				"margin-top": -clipHeight/2
			});
			$mask_left.css({
				"margin-right": clipWidth/2,
				"margin-top": -clipHeight/2,
				"margin-bottom": -clipHeight/2
			});
			$mask_right.css({
				"margin-left": clipWidth/2,
				"margin-top": -clipHeight/2,
				"margin-bottom": -clipHeight/2
			});
			$mask_top.css({
				"margin-bottom": clipHeight/2
			});
			$mask_bottom.css({
				"margin-top": clipHeight/2
			});
			$clip_area.css({
				"width": clipWidth,
				"height": clipHeight,
				"margin-left": -clipWidth/2 - 1,
				"margin-top": -clipHeight/2 - 1
			});

			if (curImgWidth && curImgHeight) {
				var offsetX = (clipWidth - oldWidth) / 2 * myScroll.scale,
					offsetY = (clipHeight - oldHeight) / 2 * myScroll.scale;
				myScroll.scrollBy(offsetX, offsetY);
				refreshScroll(curImgWidth, curImgHeight);
			}
		}

		function setImg(src) {
			createImg(src);
		}

		function destroy() {
			$file.off("change");
			$file = null;

			if (hammerManager) {
				hammerManager.off("rotatemove");
				hammerManager.off("rotateend");
				hammerManager.destroy();
				hammerManager = null;
			} else {
				$moveLayer.off("dblclick");
			}

			myScroll.destroy();
			myScroll = null;

			$container.empty();
			$container = null;
			$clipView = null;
			$moveLayer = null;
			$rotateLayer = null;

			$view.css({
				"background-color": "",
				"background-repeat": "",
				"background-position": "",
				"background-size": ""
			});
			$view = null;
		}

		self.setSize = setSize;
		self.setImg = setImg;
		self.rotateCW = rotateCW;
		self.rotateCCW = rotateCCW;
		self.destroy = destroy;
	}

	var prefix = '',
		transitionEnd;

	(function() {

		var eventPrefix,
			vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
	    	testEl = document.documentElement,
	    	normalizeEvent = function(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() };

		for (var i in vendors) {
			if (testEl.style[i + 'TransitionProperty'] !== undefined) {
				prefix = '-' + i.toLowerCase() + '-';
				eventPrefix = vendors[i];
				break;
			}
		}

		transitionEnd = normalizeEvent('TransitionEnd');

	})();

	return PhotoClip;
}));

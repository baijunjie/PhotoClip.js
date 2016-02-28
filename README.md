# jQuery-photoClip v1.6.0
一款支持手势的裁图插件插件

由于目前网上很难找到一款支持手势的裁图插件，因此自己动手写了一个。为了快速开发，依赖了很多其他的开源插件。不过目前仅解决需求即可。

## 依赖插件

<del>[[jquery.transit.js]](https://github.com/rstacruz/jquery.transit) 插件</del> （v1.4 中已经移除了对该插件的依赖）<br>
[[iscroll-zoom.js]](https://github.com/cubiq/iscroll) 插件（由于原插件的zoom扩展存在几个bug，所以建议使用demo中提供的iscroll-zoom.js文件，本人已经将这些bug修复）<br>
[[hammer.js]](https://github.com/hammerjs/hammer.js) 插件 <br>
[[lrz.all.bundle.js]](https://github.com/think2011/localResizeIMG) 插件

## 操作说明

在移动设备上双指捏合为缩放，双指旋转可根据旋转方向每次旋转90度

在PC设备上鼠标滚轮为缩放，每次双击则顺时针旋转90度

## 使用方法及参数配置简介

```html
<script src="js/jquery-2.1.3.min.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/iscroll-zoom.min.js"></script>
<script src="js/lrz.all.bundle.js"></script>
<script src="js/jquery.photoClip.min.js"></script>
<script>
$("#clipArea").photoClip({
	width: 200, // 截取区域的宽度
	height: 200, // 截取区域的高度
	file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
	view: "#view", // 显示截取后图像的容器的选择器或者DOM对象
	ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
	//outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
	strictSize: false, // 是否严格按照截取区域宽高裁剪。默认为false，表示截取区域宽高仅用于约束宽高比例。如果设置为true，则表示截取出的图像宽高严格按照截取区域宽高输出
	loadStart: function(file) {}, // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
	loadComplete: function(src) {}, // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
	loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
	clipFinish: function(dataURL) {}, // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
});
</script>
```

# Changelog

## v1.6
* 修复了ios设备中获取照片方向错误的bug
* 由于依赖了localResizeIMG插件，outputType选项暂时移除

## v1.5
* 添加了outputType选项
* 支持模块化

## v1.4
* 添加了strictSize选项
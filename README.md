# jQuery-photoClip
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
<div id="clipArea"></div>
<input type="file" id="file">
<button id="clipBtn">截取</button>
<div id="view"></div>

<script src="js/jquery-2.1.3.min.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/iscroll-zoom.min.js"></script>
<script src="js/lrz.all.bundle.js"></script>
<script src="js/jquery.photoClip.min.js"></script>
<script>
var clipArea = new bjj.PhotoClip("#clipArea", {
	size: [260, 260], // 截取框的宽和高组成的数组。默认值为[260,260]
	outputSize: [640, 640], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
	outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
	file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
	source: "", // 需要裁剪图片的url地址。该参数表示当前立即开始裁剪的图片，不需要使用file控件获取。注意，该参数不支持跨域图片。
	view: "#view", // 显示截取后图像的容器的选择器或者DOM对象
	ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
	loadStart: function(file) {}, // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
	loadComplete: function(src) {}, // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
	loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
	clipFinish: function(dataURL) {}, // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
});
</script>
```

## Destroy
```js
clipArea.destroy();
```


# Changelog

## v1.9
* 添加了source选项，支持通过url地址获取需要裁剪的源图片
* 重新添加了outputType选项

## v1.8
* 修改了创建方式
* 添加了销毁方法 destroy()

## v1.7
* 移除了width、height选项，使用size选项替代
* 移除了strictSize选项，使用outputSize选项替代，用于指定输出图像的大小

## v1.6
* 修复了ios设备中获取照片方向错误的bug
* 由于依赖了localResizeIMG插件，outputType选项暂时移除

## v1.5
* 添加了outputType选项
* 支持模块化

## v1.4
* 添加了strictSize选项


# 您的捐助是我最大的动力
![image](https://github.com/baijunjie/jQuery-photoClip/blob/master/donations.jpg)
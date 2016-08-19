# PhotoClip.js
一款支持手势的裁图插件插件

由于目前网上很难找到一款支持手势的裁图插件，因此自己动手写了一个。为了快速开发，依赖了很多其他的开源插件。不过目前仅解决需求即可。

## 依赖插件

[[jquery.js]](https://github.com/jquery/jquery) 插件 <br>
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

<script src="js/jquery-3.0.0.min.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/iscroll-zoom.min.js"></script>
<script src="js/lrz.all.bundle.js"></script>
<script src="js/jquery.photoClip.min.js"></script>
<script>
var clipArea = new bjj.PhotoClip("#clipArea", {
	size: [260, 260], // 截取框的宽和高组成的数组。默认值为[260,260]
	adaptive: null, // 截取框自适应，截取框宽和高的百分比组成的数组。默认为 null。如果设置了该参数，且值有效，则会忽略 size 的大小设置，size 中的值仅用于计算宽高比。当设置了其中一个值得百分比时，如果另一个未设置，则将会按 size 中的比例等比缩放。
	outputSize: [640, 640], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
	outputType: "jpg", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
	outputQuality: .8, // 输出质量，取值 0 - 1，默认为0.8。（这个质量不是最终输出的质量，与 lrzOption.quality 是相乘关系）
	file: "#file", // 上传图片的<input type="file">控件的选择器或者DOM对象
	source: "", // 需要裁剪图片的url地址。该参数表示当前立即开始裁剪的图片，不需要使用 file 控件获取。注意，该参数不支持跨域图片。
	view: "#view", // 显示截取后图像的容器的选择器或者DOM对象
	ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
	loadStart: function(file) {}, // 开始加载的回调函数。this指向当前 PhotoClip 的实例对象，并将正在加载的 file 对象作为参数传入（如果是使用 source 加载图片，则该参数为图片的 img 对象）
	loadComplete: function(img) {}, // 加载完成的回调函数。this指向当前 PhotoClip 的实例对象，并将图片的 img 对象作为参数传入
	loadError: function(event) {}, // 加载失败的回调函数。this指向当前 PhotoClip 的实例对象，并将错误事件的 event 对象作为参数传入
	clipFinish: function(dataURL) {}, // 裁剪完成的回调函数。this指向当前 PhotoClip 的实例对象，会将裁剪出的图像数据DataURL作为参数传入
	lrzOption: { // lrz压缩插件的配置参数
		width: null, // 图片最大不超过的宽度，默认为原图宽度，高度不设时会适应宽度。
		height: null, // 图片最大不超过的高度，默认为原图高度，宽度不设时会适应高度。
		quality: .7, // 图片压缩质量，取值 0 - 1，默认为0.7。（这个质量不是最终输出的质量，与 outputQuality 是相乘关系）
	}
});
</script>
```

## API
```js
clipArea.setSize(width, height); // 重新定义截取框的宽和高，如果设置了自适应，则等于重新定义宽高比例
clipArea.setImg(src); // 重新读取裁剪图片
clipArea.rotateCW(); // 顺时针旋转90度
clipArea.rotateCCW(); // 逆时针旋转90度
clipArea.destroy(); // 销毁
```


# Changelog

## v2.0.2
* 添加了 outputQuality 选项，现在可以控制 canvas 截图的输出质量了。

## v2.0.1
* 修复了使用 setSize() 后，图片移动位置不正确的问题

## v2.0.0
* 新增了实例方法 setSize(width, height)。作用是重新定义截取框的宽和高，如果设置了自适应，则等于重新定义宽高比例。
* 新增了实例方法 setImg(src)。作用是根据url地址重新加载图片。
* 新增了实例方法 rotateCW()。作用是使图片顺时针旋转90度。
* 新增了实例方法 rotateCCW()。作用是使图片逆时针旋转90度。

## v1.10.1
* 添加了 adaptive 选项，接受一个宽和高的百分比组成的数组。截取框将按照这个百分比来设置大小。当设置了其中一个值得百分比时，如果另一个未设置，则将会按 size 中的比例等比缩放。
* 修复了 chrome 下打开 file 控件过慢的问题。

## v1.10.0
* 增加了 [[lrz.all.bundle.js]](https://github.com/think2011/localResizeIMG) 插件[（文档）](https://github.com/think2011/localResizeIMG/wiki/2.-%E5%8F%82%E6%95%B0%E6%96%87%E6%A1%A3)的配置参数，如果加载完图片后出现卡顿或崩溃现象，可以尝试设置此参数。

## v1.9.1
* 兼容 jQuery 3.0

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
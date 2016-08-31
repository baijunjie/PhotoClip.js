# PhotoClip.js
一款支持手势的裁图插件插件

由于目前网上很难找到一款支持手势的裁图插件，因此自己动手写了一个。为了快速开发，依赖了很多其他的开源插件。不过目前仅解决需求即可。

[Changelog](https://github.com/baijunjie/PhotoClip.js/blob/master/Changelog.md)

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
<script src="js/iscroll-zoom.js"></script>
<script src="js/lrz.all.bundle.js"></script>
<script src="js/PhotoClip.js"></script>
<script>
var clipArea = new PhotoClip("#clipArea", {
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

## AMD
由于引入的开源插件较多，因此很多小伙伴感觉在移动端比较臃肿，这里推荐大家用模块化的方式管理插件，最终可以用打包工具进行整合。
这里以 RequireJS 为例：

```js
require.config({
	paths: {
		'jquery': 'js/jquery-3.0.0.min',
		'hammer': 'js/hammer.min',
		'iscroll-zoom': 'js/iscroll-zoom',
		'lrz': 'js/lrz.all.bundle',
		'PhotoClip': 'js/PhotoClip'
	}
});

require(['PhotoClip'], function(PhotoClip) {
	new PhotoClip("#clipArea", {...});
});
```



# 您的捐助是我最大的动力
![image](https://github.com/baijunjie/PhotoClip.js/blob/master/donations.jpg)
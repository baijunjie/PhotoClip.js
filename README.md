# PhotoClip.js v3
一款手势驱动的裁图插件，**移动端照片裁剪的简洁化解决方案！**

- 在移动设备上双指捏合为缩放，双指转动为旋转
- 在PC设备上鼠标滚轮为缩放，每次双击则顺时针旋转90度

[**Demo**](http://htmlpreview.github.io/?https://github.com/baijunjie/PhotoClip.js/blob/master/index.html)（如果无法打开，请翻墙，或者自行下载体验）

[**Changelog**](https://github.com/baijunjie/PhotoClip.js/blob/master/Changelog.md)



## 兼容

IE10及以上版本，Chrome、Firefox、Safari、Android、微信等主流先进浏览器



## 依赖插件

[**iscroll-zoom.js**](https://github.com/cubiq/iscroll)   
[**hammer.js**](https://github.com/hammerjs/hammer.js)  
[**lrz.all.bundle.js**](https://github.com/think2011/localResizeIMG) 

由于 iscroll 原插件的 zoom 扩展存在几处 bug，所以建议使用 demo 中提供的 iscroll-zoom.js 文件，本人已经将这些 bug 修复，并针对本插件做了优化。



## 使用方法

#### 一般引入

```html
<div id="clipArea"></div>
...
<script src="js/iscroll-zoom.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/lrz.all.bundle.js"></script>
<script src="js/PhotoClip.js"></script>
<script>
var pc = new PhotoClip('#clipArea');
</script>
```

#### AMD模块化引入

```js
require.config({
	paths: {
		'iscroll-zoom': 'js/iscroll-zoom',
		'hammer': 'js/hammer.min',
		'lrz': 'js/lrz.all.bundle',
		'PhotoClip': 'js/PhotoClip'
	},
	shim: {
		'iscroll-zoom': {
			exports: 'IScroll'
		}
	}
});

require(['PhotoClip'], function(PhotoClip) {
	new PhotoClip('#clipArea');
});
```

#### 通过npm引入

安装

```
$ npm install photoclip
```

引入

```js
// ES6
import PhotoClip from 'photoclip'
// CommonJS
var PhotoClip = require('photoclip')
```



## PhotoClip 构造函数

new PhotoClip( **container** [, **options**] )

构造函数有两个主要参数：

### container

表示图片裁剪容器的选择器或者DOM对象。

### options

配置选项，详细配置如下：

- **options.size**

  type: Number|Array

  截取框大小。  
  当值为数字时，表示截取框为宽高都等于该值的正方形。  
  当值为数组时，数组中索引`[0]`和`[1]`所对应的值分别表示宽和高。  
  默认值为 `[100,100]`。

- **options.adaptive**

  type: String|Array

  截取框自适应。设置该选项后，`size` 选项将会失效，此时 `size` 进用于计算截取框的宽高比例。  
  当值为一个百分数字符串时，表示截取框的宽度百分比。  
  当值为数组时，数组中索引 `[0]` 和 `[1]` 所对应的值分别表示宽和高的百分比。  
  当宽或高有一项值未设置或值无效时，则该项会根据 `size` 选项中定义的宽高比例自适应。  
  默认为 ` ''`。

- **options.outputSize**

  type: Number|Array

  输出图像大小。  
  当值为数字时，表示输出宽度，此时高度根据截取框比例自适应。  
  当值为数组时，数组中索引 `[0]` 和 `[1]` 所对应的值分别表示宽和高，若宽或高有一项值无效，则会根据另一项等比自适应。  
  默认值为`[0,0]`，表示输出图像原始大小。

- **options.outputType**

  type: String

  指定输出图片的类型，可选 'jpg' 和 'png' 两种种类型，默认为 'jpg'。


- **options.outputQuality**

  type: String

  图片输出质量，取值 0 - 1，默认为0.8。（这个质量并不是图片的最终质量，而是在经过 lrz 插件压缩后的基础上输出的质量。相当于 `outputQuality` * `lrzOption.quality`）  

- **options.rotateFree**

  type: Boolean

  是否启用图片自由旋转。由于安卓浏览器上存在性能问题，因此在安卓设备上默认关闭。


- **options.view**

  type: String|HTMLElement

  显示截取后图像的容器的选择器或者DOM对象。


- **options.file**

  type: String|HTMLElement

  上传图片的 \<input type="file"\> 控件的选择器或者DOM对象。


- **options.ok**

  type: String|HTMLElement

  确认截图按钮的选择器或者DOM对象。


- **options.img**

  type: String

  需要裁剪图片的url地址。该参数表示当前立即开始读取图片，不需要使用 file 控件获取。注意，加载的图片必须要与本程序同源，如果图片跨域，则无法截图。


- **options.loadStart**

  type: Function

  图片开始加载的回调函数。`this` 指向当前 `PhotoClip` 的实例对象，并将正在加载的 file 对象作为参数传入。（如果是使用非 file 的方式加载图片，则该参数为图片的 \<img\> 对象）

- **options.loadComplete**

  type: Function

  图片加载完成的回调函数。`this` 指向当前 `PhotoClip` 的实例对象，并将图片的 \<img\> 对象作为参数传入。


- **options.loadError**

  type: Function

  图片加载失败的回调函数。`this` 指向当前 `PhotoClip` 的实例对象，并将错误信息作为第一个参数传入，如果还有其它错误对象或者信息会作为第二个参数传入。


- **options.done**

  type: Function

  裁剪完成的回调函数。`this` 指向当前 `PhotoClip` 的实例对象，会将裁剪出的图像数据DataURL作为参数传入。


- **options.fail**

  type: Function

  裁剪失败的回调函数。`this` 指向当前 `PhotoClip` 的实例对象，会将失败信息作为参数传入。

- **options.lrzOption**

  type: Object

  lrz 压缩插件的配置参数。该压缩插件作用于图片从相册输出到移动设备浏览器过程中的压缩，配置的高低将直接关系到图片在移动设备上操作的流畅度。以下为子属性：

  - **options.lrzOption.width**：

    type: Number

    图片最大不超过的宽度，默认为原图宽度，高度不设时会适应宽度。（由于安卓浏览器存在性能问题，所以默认值为 1000）

  - **options.lrzOption.height**

    type: Number

    图片最大不超过的高度，默认为原图高度，宽度不设时会适应高度。（由于安卓浏览器存在性能问题，所以默认值为 1000）

  - **options.lrzOption.quality**

    type: Number

    图片压缩质量，取值 0 - 1，默认为0.7。（这个质量不是最终输出的质量，与 `options.outputQuality` 是相乘关系）

- **options.style**

  type: Object

  样式配置。以下为子属性：

  - **options.style.maskColor**

    type: String

    遮罩层的颜色。默认为 `'rgba(0,0,0,.5)'`。

  - **options.style.maskBorder**

    type: String

    遮罩层的 border 样式。默认为 `'2px dashed #ddd'`。

  - **options.style.jpgFillColor**

    type: String

    当输出 jpg 格式时透明区域的填充色。默认为 `'#fff'`。

- **options.errorMsg**

  type: Object

  错误信息对象，包含各个阶段出错时的文字说明。以下为子属性：

  - **options.errorMsg.noSupport**

    type: String

    浏览器无法支持本插件。将会使用 `alert` 弹出该信息，若不希望弹出，可将该值置空。

  - **options.errorMsg.notFile**

    type: String

    不支持 `FileReader` API，不能使用 file 控件读取图片的错误信息。将会使用 `alert` 弹出该信息，若不希望弹出，可将该值置空。

  - **options.errorMsg.imgError**

    type: String

    使用 file 控件读取图片格式错误时的错误信息。将会在 `loadError` 回调的错误信息中输出。

  - **options.errorMsg.imgHandleError**

    type: String

    lrz 压缩插件处理图片失败时的错误信息。将会在 `loadError` 回调的错误信息中输出。

  - **options.errorMsg.imgLoadError**

    type: String

    图片加载出错时的错误信息。将会在 `loadError` 回调的错误信息中输出。

  - **options.errorMsg.noImg**

    type: String

    没有加载完成的图片时，执行截图操作时的错误信息。将会在 `fail` 回调的失败信息中输出。

  - **options.errorMsg.clipError**

    type: String

    截图出错时的错误信息。将会在 `fail` 回调的失败信息中输出。



## PhotoClip 对象实例方法

```js
/**
 * 设置截取框的宽高
 * 如果设置了 adaptive 选项，则该方法仅用于修改截取框的宽高比例
 * @param  {Number} width  截取框的宽度
 * @param  {Number} height 截取框的高度
 * @return {PhotoClip}     返回 PhotoClip 的实例对象
 */
pc.size(width, height);

/**
 * 加载一张图片
 * @param  {String} src 图片的 url
 * @return {PhotoClip}  返回 PhotoClip 的实例对象
 */
pc.load(src);

/**
 * 清除当前图片
 * @return {PhotoClip}  返回 PhotoClip 的实例对象
 */
pc.clear();

/**
 * 图片在当前角度的基础上旋转
 * @param  {Number} angle    在当前角度的基础上旋转的角度
 * @param  {Number} duration 可选，旋转动画的时长，如果为 0 或 false，则表示没有过渡动画
 * @param  {Object} center   可选，旋转中心点，相对于窗口的坐标对象，包含 x、y。默认为截取框的中心点
 * @return {PhotoClip}       返回 PhotoClip 的实例对象
 */
pc.rotateBy(angle, duration, center);

/**
 * 图片旋转到指定角度
 * @param  {Number}  angle      旋转的角度
 * @param  {Number}  duration   可选，旋转动画的时长，如果为 0 或 false，则表示没有过渡动画
 * @param  {Object}  center     可选，旋转中心点，相对于窗口的坐标对象，包含 x、y。默认为截取框的中心点
 * @return {PhotoClip}          返回 PhotoClip 的实例对象
 */
pc.rotateTo(angle, duration, center);

/**
 * 截图
 * @return {String}  返回截取后图片的 Base64 字符串
 */
pc.clip();

/**
 * 销毁
 * @return {Undefined}  无返回值
 */
pc.destroy();
```



## FAQ

#### Q: 为什么使用插件裁剪出来的图片比原始图还大？

#### A:

PhotoClip.js 仅仅是一个前端裁图插件，其中用到的压缩是为了防止手机中过大的照片（约2MB）载入到某些手机浏览器中导致崩溃的问题，原理上是用canvas来实现的。

因此对于一些过小的图片（几十KB）,有时裁剪出的图片反而会变大（几百KB），这种现象是正常现象。如果对于图片压缩效果不满意，建议将图片传到后端，由后端图形引擎进行真正的压缩处理。

#### Q: 为什么在旋转图片操作时卡顿严重，甚至图片时有时无，更严重的导致浏览器崩溃？

#### A:

由于照片自身尺寸很大，配置越高的手机往往一张照片的尺寸会达到几千的像素宽高，这种图片加载进浏览器后，会占用大量的内存。如果对图片进行移动、缩放、旋转等操作时，浏览器就需要对图片进行重绘，此时就会消耗设备性能。尤其是图片进行旋转操作时，对设备的性能消耗巨大。这一点在安卓设备上尤为突出。

因此，如果出现上述问题，请使用 `options.lrzOption` 选项，限制图片的最大宽高，可以有效的降低浏览器的压力，但副作用是会大大的降低图片的质量。



# 您的捐助是我最大的动力
![image](https://github.com/baijunjie/PhotoClip.js/blob/master/donations.jpg)
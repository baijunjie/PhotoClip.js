# Changelog

### v3.1.1

- `options.view`、`options.file`、`options.ok` 现在可以支持同时传入多个，可使用英文逗号隔开的选择器字符串，或者DOM对象数组。

### v3.1.0

- 新增 `rotate` 方法
- 新增 `scale` 方法
- 废除了 `rotateBy` 与 `rotateTo` 方法，使用 `rotate` 替代

### v3.0.8

- 现在插件可以通过 npm 进行安装了。

### v3.0.3

- 修复了通过 `load()` 方法加载照片时，不会被压缩且不能被正确识别拍摄方向的问题。

### v3.0.2

- 增加了 `rotateFree` 选项，用于设置是否启用图片自由旋转功能。由于性能原因，在安卓设备上默认关闭。
- 同样由于性能原因，在安卓设备上 `options.lrzOption.width` 和 `options.lrzOption.height` 默认设为 1000。
- 优化了复位动画。

### v3.0.1

- 修复了配置项中 `file`、`view`、`ok` 直接传入 DOM 元素报错的问题。

### v3.0.0

- 将代码进行重构优化，使生成对象占用更小的内存。
- 重构所有 API 接口。
- 移除了对 jQuery 的依赖，并更新了其他依赖插件。
- 图片可任意角度旋转，不再局限于90度。

### v2.0.5
- 修复了 `destroy()` 方法销毁不彻底的问题。 

### v2.0.4
- 为了防止在移动设备上 flie 控件有时失效的问题，在移动设备上不在指定 flie 控件的 `accept` 类型。

### v2.0.3
- 在非模块化引入的情况下，修改全局变量为 `PhotoClip`。

### v2.0.2
- 添加了 `outputQuality` 选项，现在可以控制 canvas 截图的输出质量了。

### v2.0.1
- 修复了使用 `setSize()` 后，图片移动位置不正确的问题。

### v2.0.0
- 新增了实例方法 `setSize(width, height)`。作用是重新定义截取框的宽和高，如果设置了自适应，则等于重新定义宽高比例。
- 新增了实例方法 `setImg(src)`。作用是根据url地址重新加载图片。
- 新增了实例方法 `rotateCW()`。作用是使图片顺时针旋转90度。
- 新增了实例方法 `rotateCCW()`。作用是使图片逆时针旋转90度。

### v1.10.1
- 添加了 `adaptive` 选项，接受一个宽和高的百分比组成的数组。截取框将按照这个百分比来设置大小。当设置了其中一个值得百分比时，如果另一个未设置，则将会按 size 中的比例等比缩放。
- 修复了 chrome 下打开 file 控件过慢的问题。

### v1.10.0
- 增加了 [[lrz.all.bundle.js]](https://github.com/think2011/localResizeIMG) 插件[（文档）](https://github.com/think2011/localResizeIMG/wiki/2.-%E5%8F%82%E6%95%B0%E6%96%87%E6%A1%A3)的配置参数，如果加载完图片后出现卡顿或崩溃现象，可以尝试设置此参数。

### v1.9.1
- 兼容 jQuery 3.0

### v1.9
- 添加了 `source` 选项，支持通过 url 地址获取需要裁剪的源图片
- 重新添加了 `outputType` 选项

### v1.8
- 修改了创建方式
- 添加了销毁方法 `destroy()`

### v1.7
- 移除了 `width`、`height` 选项，使用 `size` 选项替代
- 移除了 `strictSize` 选项，使用 `outputSize` 选项替代，用于指定输出图像的大小

### v1.6
- 修复了 ios 设备中获取照片方向错误的 bug
- 由于依赖了 localResizeIMG 插件，`outputType` 选项暂时移除

### v1.5
- 添加了 `outputType` 选项
- 支持模块化

### v1.4
- 添加了 `strictSize` 选项
# Changelog

## v2.0.3
* 在非模块化引入的情况下，修改全局变量为 PhotoClip

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
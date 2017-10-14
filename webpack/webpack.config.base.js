'use strict'
const path = require('path');
const webpack = require('webpack');
const UMDConfig = require('./UMD.config');
const pkg = require('../package.json');

const PROJECT_NAME = 'PhotoClip';
process.env.PROJECT_NAME = PROJECT_NAME;

module.exports = {
    entry: {
        [PROJECT_NAME]: './src/index.js' // 相对于根目录
    },
    output: {
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
    externals: UMDConfig,
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: [path.resolve(__dirname, '../src')],
            options: {
                presets: [
                    ['env', { 'modules': false }],
                    'stage-0'
                ],
                plugins: [
                    // 这个插件可以兼容一些ES6新增特性，但是也会增加代码体积，慎用
                    // 'transform-runtime',

                    // 以下两个插件的作用是
                    // export default 导出的 ES6 模块被 babel 转义成 UMD 模块后
                    // require 该模块可以直接得到模块返回值，而不是在 default 属性上
                    'add-module-exports',
                    'transform-es2015-modules-umd'
                ]
            }
        }]
    }
};
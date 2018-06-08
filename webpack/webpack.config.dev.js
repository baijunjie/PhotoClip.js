const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseWebpackConfig = require('./webpack.config.base');

module.exports = merge(baseWebpackConfig, {
    // Provides process.env.NODE_ENV with value development.
    // Enables NamedModulesPlugin.
    mode: 'development',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: process.env.PROJECT_NAME,
            filename: 'index.html', // 相对于输出目录
            template: './src/index-template.html', // 相对于根目录
            inject: false // 取消自动注入，使用模板手动注入
        })
    ],
    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, '../demo'),
        compress: true, // 一切服务都启用 gzip 压缩
        inline: true,
        hot: true,
        port: 9000
    }
});
const path = require('path');
const bundlePath = path.resolve(__dirname,'dist');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
require('babel-polyfill');

module.exports = {
    entry: ['babel-polyfill','./src/js/app.js'],
    node:{
        fs:"empty"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use:['file-loader']
            }
        ]
    },
    devtool: 'eval-source-map',
    output: {
        path: bundlePath,
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
       port: 4500,
       historyApiFallback:true
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV":JSON.stringify("developement")
        }),
        new webpack.HotModuleReplacementPlugin(),
        new HTMLWebpackPlugin({
            template: './public/index.html'
        }),
        new CleanWebpackPlugin(['dist'])
    ]
}
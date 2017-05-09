/**
 * Created by johnson on 09.05.17.
 */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: path.resolve(__dirname, './src'),
    entry: "./index.js",
    output: {
        filename: 'Context2DTracked.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'Context2DTracked',
        libraryTarget: 'umd',
    },
    devServer: {
        contentBase: path.resolve(__dirname, './src'),  // New
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{
                    loader: 'babel-loader',
                    options: {presets: ['es2015']},
                }],
            },
        ]
    }
};

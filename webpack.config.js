/**
 * Nextcloud Cookbook app
 * Main Webpack configuration file.
 * Different configurations for development and build runs
 *  are located in the appropriate files.
 */
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {

    entry:{
        vue: path.join(__dirname, 'src', 'main.js'),
    },
    output: {
        path: path.resolve(__dirname, './js'),
        publicPath: '/js/',
        filename: '[name].js',
        chunkFilename: '[name].js?v=[contenthash]',
    },
    // HACK:
    // target: 'node',
    // externals: {
    //     "request": "request"
    // },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
            {
                test: /\.html$/,
                loader: 'vue-template-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                },
            },
            {
                test: /\.(eot|woff|woff2|ttf)$/,
                loaders: 'file-loader',
                options: {
                    name: '[path][name].[ext]?[hash]'
                },
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new BundleAnalyzerPlugin(),
        new LodashModuleReplacementPlugin
    ],
    resolve: {
        extensions: ['*', '.js', '.vue', '.json'],
        modules: [
            path.resolve(__dirname, './node_modules')
        ],
        symlinks: false,
    },

}

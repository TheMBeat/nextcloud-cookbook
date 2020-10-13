const merge = require('webpack-merge')
const common = require('./webpack.config.js')
const TerserPlugIn = require('terser-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    optimization:
    {
        minimizer: [
            new TerserPlugIn({
                terserOptions:{
                    output:{
                        comments: false
                    }
                },
                sourceMap: true
            })
        ],
    }
})

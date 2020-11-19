const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './frontend/static/js/iart.js',
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve('./frontend/static/', 'dist'),
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
        }
    },
    module: {
        rules: [
            // ... other rules
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: isProd
                    }
                }
            })
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};
'use strict';

const path                  = require('path');
const webpack               = require('webpack');
const nodeExternals         = require('webpack-node-externals');
const UglifyJSPlugin        = require('uglifyjs-webpack-plugin');
const VirtualModulePlugin   = require('virtual-module-webpack-plugin');
const reduxExports          = require('./redux.exports');
const _                     = require('underscore');

module.exports = (gulpConfig, type = 'app') => {
    // shallow copy config and config.defines to prevent squashing server env
    let config = _.clone(gulpConfig);
    config.defines = _.clone(gulpConfig.defines);

    let plugins    = [
        // Importable Modules that are generated code, not in filesystem
        new VirtualModulePlugin({
            moduleName: 'src/app/redux-exports.js',
            contents: reduxExports,
        }),
    ];
    let tools      = '';
    let env        = config.env || 'production';
    let target     = (type === 'server') ? 'node' : 'web';
    let filename   = (type === 'server') ? 'index.js' : '[name].js';
    let entries    = (type === 'server') ? './src/index.js' : config.entries;

    let dest       = (type === 'server') ? config.dest.server : config.dest.js;
    let externals  = [];

    if (type === 'server' && env !== 'development') {
        externals.push(nodeExternals());
    };

    if (env !== 'development' || type === 'server' && false) {
        plugins.push(new UglifyJSPlugin());
    } else {
        tools = 'source-map';
    }

    // Only override process.env on client side
    if ( type === 'app' ) {
        config.defines['process.env'] = {
            NODE_ENV: JSON.stringify(env)
        };
    }
    plugins.push(new webpack.DefinePlugin(config.defines));

    return {
        target: target,
        entry: entries,
        devtool: tools,
        plugins: plugins,
        externals: externals,
        resolve: {
            alias: {
                appdir: config.src.appdir,
                rootdir: config.src.rootdir,
            }
        },
        output:  {
            path: path.resolve(__dirname, dest),
            filename: filename,
        },
        module:  {
            loaders: [
                {
                    test           : [/\.js$/],
                    loader         : 'babel-loader',
                    exclude        : /node_modules/,
                    query          : {
                        presets    : ['react', ['env', {
                            targets: {
                                browsers: [config.browsers],
                            },
                        }]],
                        plugins    : ['transform-object-rest-spread'],
                    }
                }
            ]
        },
    };
};

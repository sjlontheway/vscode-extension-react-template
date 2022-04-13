//@ts-check

'use strict';

const path = require('path');
// eslint-disable-next-line @typescript-eslint/naming-convention
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionUIConfig = {
    mode: 'development', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: 'web', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    entry: {
        debuggerUI: './src/debugger-ui/debugger-view/index.tsx',
    }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(path.dirname(__dirname), 'dist/debuggerUI'),
        filename: '[name].js',
        libraryTarget: 'umd',
    },

    watchOptions: {
        ignored: /node_modules/,
        poll: true,
    },
    externals: {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.tsx', '.jsx', '.js'],
        fallback: {
            path: require.resolve('path-browserify'),
        },
    },
    module: {
        rules: [
            {
                test: /[\.ts|\.tsx|\.jsx|\.js]$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript',
                                '@babel/preset-react',
                            ],
                            plugins: [
                                '@babel/transform-runtime',
                                '@babel/plugin-proposal-object-rest-spread',
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/i,
                use: [
                    // compiles Less to CSS
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
            },
        ], 
    },
    devtool: 'inline-source-map',
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
};
module.exports = extensionUIConfig;

var webpack = require('webpack'),
	path = require('path');

module.exports = {

	entry: "./modules/index.js",

    output: {
        path: __dirname,
        filename: "main.js"
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                plugins: ['transform-runtime'],
                presets: ['es2015']
            },
        }]
    },

    resolve: {
        root: [path.join(__dirname, "bower_components")]
    },

    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        )
    ],

    devtool: 'source-map'
};
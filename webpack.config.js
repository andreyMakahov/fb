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
                plugins: [
                    'check-es2015-constants',
                    'transform-es2015-arrow-functions',
                    'transform-es2015-block-scoped-functions',
                    'transform-es2015-block-scoping',
                    'transform-es2015-classes',
                    'transform-es2015-computed-properties',
                    'transform-es2015-destructuring',
                    'transform-es2015-for-of',
                    'transform-es2015-function-name',
                    'transform-es2015-literals', 
                    [
                        'transform-es2015-modules-commonjs', { 
                            'allowTopLevelThis': true 
                        }
                    ],
                    'transform-es2015-object-super',
                    'transform-es2015-parameters',
                    'transform-es2015-shorthand-properties',
                    'transform-es2015-spread',
                    'transform-es2015-sticky-regex',
                    'transform-es2015-template-literals',
                    'transform-es2015-typeof-symbol',
                    'transform-es2015-unicode-regex',
                    'transform-regenerator'
                ]
            },
        }]
    },

    target: 'node-webkit',

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
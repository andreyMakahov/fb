var NwBuilder = require('nw-builder');
var args = require('yargs').argv;

var nw = new NwBuilder({
    files: args.path || 'd:/repos/fb/**/*',
    platforms: ['win64', 'osx64', 'linux64'],
    version: '0.12.3',
    buildDir: 'dest'
});

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});

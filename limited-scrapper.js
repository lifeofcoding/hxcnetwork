const limiter = require('./node-cpulimit/index.js');
const shell = require('shelljs');

const proc = shell.exec('node ./checker.js', {async:true});

proc.stdout.on('data', function(data) {
    //console.log('' + data);
    //process.stdout.write(`data: ${''+ data}`);
});


const options = {
    limit: 60,
    includeChildren: true,
    pid: proc.pid
};

limiter.createProcessFamily(options, function(err, processFamily) {
    if(err) {
        console.error('Error:', err.message);
        return;
    }

    limiter.limit(processFamily, options, function(err) {
        if(err) {
            console.error('Error:', err.message);
        }
        else {
            console.log('Done.');
        }
    });
});

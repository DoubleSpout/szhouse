var cluster = require('cluster');
var loop_fn = require('./dom.js').loop_fn;
var log4js = require('log4js');
var loop_time = 1000*60*60*24;

log4js.configure({
  appenders: [
    //{ type: 'console' },
    { type: 'file', filename: './logs/cheese.log', category: 'cheese' }
  ]
});
var logger = log4js.getLogger('cheese');


if (cluster.isMaster) {
  // Fork workers.

    cluster.fork();


  cluster.on('exit', function(worker, code, signal) {
  	logger.fatal('worker ' + worker.process.pid + ' died');
  	cluster.fork();
  });
} else {
    loop_fn();
	setInterval(function(){
		loop_fn();
	},loop_time)
}







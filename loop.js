var cluster = require('cluster');
var schedule = require('node-schedule');
var loop_fn = require('./dom.js').loop_fn;
var log4js = require('log4js');
var loop_time = 1000*60*60*8;

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: __dirname+'/logs/cheese.log', category: 'cheese' }
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
	
	var rule = new schedule.RecurrenceRule();
	rule.dayOfWeek = [new schedule.Range(0, 6)];
	rule.hour = 19;
	rule.minute = 0;

	var j = schedule.scheduleJob(rule, function(){
	   loop_fn();
	});
}







var jsdom = require("jsdom");
var async = require("async");
var fs = require('fs');
var log4js = require('log4js');
var request = require('request');

var send_mail = require('./mail.js');
var house_name_array
var get_txt = require('./read_txt.js');



var logger = log4js.getLogger('cheese');
var jquery = fs.readFileSync(__dirname+"/deps/jquery.1.7.1.js").toString();



var HOUSE_URL = 'http://www.szfcweb.com/szfcweb/DataSerach/CanSaleHouseSelectIndex.aspx'
var is_send = false;

var error_fn = function(err){
	is_send =false;
	return logger.error(err); 
}

var get_count = function(err, array){
if(err) return error_fn(err)

house_name_array = array;
logger.info("send start");

is_send = true;

	jsdom.env({
	  html:HOUSE_URL,
	  src:[jquery],
	  done:function (errors, window) {
		  	if(errors) return error_fn(errors);

		  	var jq = window.$;
		  	var href_array =[];
		  	var result_array = [];

		  	var form_obj={}
		  	jq('#aspnetForm input').each(function(){
		  		form_obj[jq(this).attr('name')] = jq(this).val();
		  	})

		  	//console.log(form_obj)

		  	//获得a标签的href数组
		  	/*
				解析a标签的jquery代码
		  	*/
		  		var async_array = [];
		  		var reg = /共&nbsp\d+&nbsp条/

				house_name_array.forEach(function(v){
					async_array.push(function(callback){

						var obj = JSON.parse(JSON.stringify(form_obj));
						obj["ctl00$MainContent$txt_Pro"] = v.name
						obj["ctl00$MainContent$ddl_houseclass"] = v.is_zz ? 'HC001' : 'HC002';
						var r = request.post(HOUSE_URL,function(e,res,body){
							if(e) return callback(e);
							var zz_r = reg.exec(body);
							if(zz_r){
								zz_r = /\d+/.exec(zz_r[0]);
								result_array.push({
									name:v.name,
									count:zz_r[0]
								});
								
							}
							else{
								result_array.push({
									name:v.name,
									count:-1
								});
							}
							console.log(v.name + ' done');
							callback();
						}).form(obj)

					})
				})


				async.series(async_array,
				// optional callback
				function(err, results){
					if(err) return error_fn(err);;
			    	var str = "";
			    	result_array.forEach(function(v,i){
			    		str += v.name +'\t'+v.count+'\n<br/>';
			    	})

			    	send_mail(str, function(err,response){ //去发送邮件
			    		if(err) return error_fn(err);;
			    		//console.log(response)
			    		logger.info("send end");
			    		is_send = false;
			    	})
	
				});
  
	  }//end done function
	
	});//end jsdom

	
	setTimeout(function(){ //如果超时重启进程
		if(is_send){
			error_fn('time out');
			process.exit(0);
		} 
	},1000*60*10)


};




exports.loop_fn = function(){ 
	get_txt(get_count);
	
};
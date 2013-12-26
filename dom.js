var jsdom = require("jsdom");
var async = require("async");
var fs = require('fs');
var log4js = require('log4js');
var request = require('request');
var http = require('http');

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

var async_array = [];

var get_count = function(err, array, real_house_url){
	if(err) return error_fn(err)
	var real_house_url = real_house_url;

	house_name_array = array;
	logger.info("send start");

	is_send = true;

	
	var push_async = function(dofunc, v){
		
	
	}

	house_name_array.forEach(function(v){
		
			async_array.push(function(callback){
				jsdom.env({
				  html:real_house_url,
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
							
							var reg = /共&nbsp\d+&nbsp条/
							var obj = JSON.parse(JSON.stringify(form_obj));
									obj["__VIEWSTATE"] = jq("#__VIEWSTATE").val();
									obj["__EVENTVALIDATION"] = jq("#__EVENTVALIDATION").val();
									obj["ctl00$MainContent$txt_Pro"] = v.name;
									obj["ctl00$MainContent$ddl_houseclass"] = v.is_zz ? 'HC001' : 'HC002';
									obj["ctl00$MainContent$txt_Com"] = v.build;
									obj["ctl00$MainContent$rb_HF_CODE"] = "-1"
									obj["ctl00$MainContent$txt_Area1"] = v.sq_min;
									obj["ctl00$MainContent$txt_Area2"] = v.sq_max;

									var r = request.post(real_house_url,function(e,res,body){
										if(e) return callback(e);
										var zz_r = reg.exec(body);
										if(zz_r){
											zz_r = /\d+/.exec(zz_r[0]);
											result_array.push({
												name:v.name,
												is_zz:v.is_zz,
												build:v.build,
												sq_min:v.sq_min,
												sq_max:v.sq_max,
												count:zz_r[0] || 0
											});
											
										}
										else{
											result_array.push({
												name:v.name,
												is_zz:v.is_zz,
												build:v.build,
												sq_min:v.sq_min,
												sq_max:v.sq_max,
												count:-1
											});
										}
										console.log(zz_r)
										console.log(v.name + 'done')

										setTimeout(function(){
											callback();
										},8000)
										
									}).form(obj)
									
			  
				  }//end done function
				
				});//end jsdom
				

			})
	})


	async.series(async_array,
		// optional callback
		function(err, results){
			
			if(err) return error_fn(err);;
			var str = "";
			var space = " "
			result_array.forEach(function(v,i){
				var iszz = v.is_zz ? '住宅' : '非住宅'
				str += iszz + '-' + v.name +'-' + v.build + '-' + v.sq_min + '*' + v.sq_max +'-'+v.count+'\n<br/>';
			
			})

			send_mail(str, function(err,response){ //去发送邮件
				if(err) return error_fn(err);;
				//console.log(response)
				logger.info("send end");
				is_send = false;
			})

		});

		
		setTimeout(function(){ //如果超时重启进程
			if(is_send){
				error_fn('time out');
				process.exit(0);
			} 
		},1000*60*30)


};


var get_real_url = function(err, array){
	if(err) return error_fn(err)
	

	http.get({
		  hostname: 'www.szfcweb.com',
		  port: 80,
		  path: '/szfcweb/DataSerach/CanSaleHouseSelectIndex.aspx',
		  method: 'GET',
	      headers:{
				"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"Accept-Language":"zh-CN,zh;q=0.8",
				"Cache-Control:":"max-age=0",
				"Host":"www.szfcweb.com",
				"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36"
		  }
	}, function(res) {
	  if(res){
		 if(res.statusCode == 302){
			var real_url = 'http://www.szfcweb.com'+res.headers["location"]
			logger.fatal(real_url);
			get_count(null, array, real_url)
			return;
		 }
		 else{
			get_count(null, array, HOUSE_URL)
		 }
	  }
	  error_fn('www.szfcweb.com not response')
	}).on('error', function(e) {
	  error_fn(err)
	});
	
}



exports.loop_fn = function(){ 
	get_txt(get_real_url);
	
};
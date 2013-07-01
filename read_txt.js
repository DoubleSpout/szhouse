String.prototype.trim= function(){ 
    // 用正则表达式将前后空格  
    // 用空字符串替代。  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}
var request = require('request');


module.exports = function(cb){

request.get('http://qinglang.w66a.bolead.com/house.txt', function (e, r, body) {

		if(e) return cb&&cb(e);

		var txt_content = body;
		var path = require('path');
		var pos_str = '---';
		var fs = require('fs');

		var all_array = txt_content.split('\n').map(function(v,i){
			if(~v.indexOf('--')) return pos_str
			return v.trim();
		})
		var pos = all_array.indexOf(pos_str);

		var zhu_zhai = all_array.slice(0,pos);
		var fei_zhu_zhai = all_array.slice(pos+1);

		var house_name_array = [];

		zhu_zhai.forEach(function(v){
			var v_ary = v.split('-');
			house_name_array.push({
				name:v_ary[0] || '',
				build:v_ary[1] || '',
				is_zz:1
			})
		})

		fei_zhu_zhai.forEach(function(v){
			var v_ary = v.split('-');
			house_name_array.push({
				name:v_ary[0] || '',
				build:v_ary[1] || '',
				is_zz:0
			})
		})
 
		cb&&cb(null, house_name_array);

 })






 

}
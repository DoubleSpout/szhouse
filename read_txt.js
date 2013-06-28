String.prototype.trim= function(){ 
    // 用正则表达式将前后空格  
    // 用空字符串替代。  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}

var pos_str = '---';
var fs = require('fs');
var txt_content = fs.readFileSync("./house.txt").toString();
var all_array = txt_content.split('\n').map(function(v,i){
	if(~v.indexOf('--')) return pos_str
	return v.trim();
})
var pos = all_array.indexOf(pos_str);

var zhu_zhai = all_array.slice(0,pos);
var fei_zhu_zhai = all_array.slice(pos+1);

var house_name_array = [];

zhu_zhai.forEach(function(v){
	house_name_array.push({
		name:v,
		is_zz:1
	})
})

fei_zhu_zhai.forEach(function(v){
	house_name_array.push({
		name:v,
		is_zz:0
	})
})


module.exports = house_name_array;


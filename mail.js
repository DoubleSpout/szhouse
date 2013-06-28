var tips = '选中复制的数字到excel,然后选中数字，选择 数据->分列，分隔符选择空格，下一步，搞定！！';
var accouont = 'loushenghai1981@hotmail.com';
var pwd = '123456lsh'
var qq_acc = require('./qq_acc.json');



var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "QQ",
    auth: {
        user: qq_acc.user,
        pass: qq_acc.pass
    }
});



var send_mail = function(string,callback){
	var string = string || '';
	var callback = callback || function(){};
	//console.log(string)

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: "loushenghai1981 ✔ <"+qq_acc.user+">", // sender address
	    to: "655028@qq.com, 53822985@qq.com", // list of receivers
	    subject: "szhouse ✔", // Subject line
	    //text: string, // plaintext body
	    html: string+"<br/><br/><br/><b>"+tips+" ✔</b>" // html body
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    callback(error,response);
	    smtpTransport.close();
	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});


}


module.exports = send_mail;
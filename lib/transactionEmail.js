var include          = require('../include').include,
    client           = include('/lib/database'),
    fs               = require('fs'),
    nodemailer       = require('nodemailer'),
    async            = require('async');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

exports.send = function(template,to,subject,cb){
  var email = {
    from:process.env.EMAIL_DISPLAY,
    to:to,
    subject:subject,
    html:template
  }

  transporter.sendMail(email, function(error, info){
  if(error){
    console.log("Transaction Email Send Error");
    console.log(error);
  }
  return cb(info)
});
}

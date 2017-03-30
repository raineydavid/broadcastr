var express = require('express'),
    Promise = require('es6-promise').Promise,
    pg = require('pg'),
    bodyParser = require('body-parser'),
    connect = require('connect'),
    fs = require('fs'),
    jsontemplate = require('./json-template'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    nodemailer = require('nodemailer'),
    Hashids = require('hashids'),
    url = require('url'),
    http = require('http'),
    WebSocketServer = require('ws').Server,
    CronJob = require('cron').CronJob,
    redis = require('redis'),
    redisStore = require('connect-redis')(session),
    kue = require('kue'),
    bcrypt = require('bcrypt-nodejs'),
    config     = require('./config'),
    async      = require('async'),
    querystring = require('querystring'),
    dateformat = require('dateformat'),
    fbCron = require('firebase-cron'),
    firebase = require('firebase'),
    admin = require('firebase-admin'),
    randomatic = require('randomatic'),
    google = require('googleapis'),
    ntl = require('number-to-letter'),
    pxl = require('pxl'),
    sheetExport = require('./sheetExport');
    error = require('./error');
    require('dotenv').config();

if (process.env.REDISTOGO_URL) {
    var rtg   = url.parse(process.env.REDISTOGO_URL);
    var redClient = redis.createClient(rtg.port, rtg.hostname);
    redClient.auth(rtg.auth.split(":")[1]);

    queue = kue.createQueue(
      {redis:process.env.REDISTOGO_URL}
    )
} else {
      var redClient = redis.createClient();

      queue = kue.createQueue(
        {redis:{
          port:6379,
          host:"127.0.0.1"
        }}
      )
}

queue.process('email',function(job,done){
  console.log(job)
  emailSend.send(job.user,job.recip,job.mergeFields,job.subj,job.body,function(emailErr,tokenError,newTokens){
    if(emailErr){console.log(emailErr)}
    if(tokenError){console.log(tokenError)}
    db.ref('/users/'+req.session.user.id+"/tokens").set(newTokens)
  })
})

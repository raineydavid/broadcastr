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
    queue = kue.createQueue(
      {redis:process.env.REDISTOGO_URL}
    ),
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
    emailSend = require('./emailSend'),
    serviceAccount = require("./echo-email-7c3f6c3d45e1.json"),
    error = require('./error');
    require('dotenv').config();

if (process.env.REDISTOGO_URL) {
    var rtg   = url.parse(process.env.REDISTOGO_URL);
    var redClient = redis.createClient(rtg.port, rtg.hostname);
    redClient.auth(rtg.auth.split(":")[1]);

} else {
      var redClient = redis.createClient();
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://echo-email.firebaseio.com/"
});

var config = {
    apiKey: "AIzaSyDn8zb14rRlQBcx74zdgXqSqoEbl-hYQJ4",
    authDomain: "echo-email.firebaseapp.com",
    databaseURL: "https://echo-email.firebaseio.com",
    storageBucket: "echo-email.appspot.com",
    messagingSenderId: "861801325411"
  };
firebase.initializeApp(config);

var db = admin.database(),
    root = db.ref()

//Google API Setup
var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2('861801325411-88uiq1nodmq0a1mqdcp4g3gb4lqeqc1k.apps.googleusercontent.com','AHxHWl5HayoqX7QaUBzOIZ5b',process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1');

google.options({auth: oauth2Client})

var objectToArray = function(input){
    return Object.keys(input).map(function(d){
      return input[d]
    })
}

var arrayToObjects = function(input,headers){
  var array = new Array
  input.forEach(function(row){
    var output = new Object

    row.forEach(function(col,i){
      output[headers[i]] = col
    })

    array.push(output)
  })
  return array
}

queue.process('email',function(job,done){
  emailSend.send(job.data.user,job.data.recip,job.data.mergeFields,job.data.subj,job.data.body,function(tokenError,newTokens){
    if(tokenError){console.log(tokenError)}
    db.ref('/users/'+job.data.user.id+"/tokens").set(newTokens)
    done()
    console.log(job.data.user.email + " - send done")
  })
})

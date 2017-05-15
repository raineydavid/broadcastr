var express     = require('express'),
    CronJob     = require('cron').CronJob,
    kue         = require('kue'),
    queue       = kue.createQueue(
                    {redis:process.env.REDISTOGO_URL}),

    app         = require('./routes/app'),
    App         = app.app,
    Server      = app.server,
    login       = require('./routes/login'),
    settings    = require('./routes/settings/settings'),
    templates   = require('./routes/templates').templates,
    wsRoutes    = require('./routes/wsRoutes'),
    db          = require('./lib/database'),
    error       = require('./lib/error'),

    auth        = require('./routes/auth'),
    email       = require('./routes/email/email'),
    reports     = require('./routes/reports/reports'),


    emailSend   = require('./lib/emailSend'),
    parse       = require('./lib/parse'),
    FBApp       = require('./lib/firebase');
    require('dotenv').config();

var objectToArray = function(input){
    return Object.keys(input).map(function(d){
      return input[d];
    });
};

var arrayToObjects = function(input,headers){
  var array = new Array;
  input.forEach(function(row){
    var output = new Object;

    row.forEach(function(col,i){
      output[headers[i]] = col;
    });

    array.push(output);
  });
  return array;
};

var trim = function(s, mask) {
  if(s.length>1){
    while (~mask.indexOf(s[s.length - 1])) {
        s = s.slice(0, -1);
    }
    return s;
  }else{
    return s;
  }
};

App.get('/register/:url_id/:timestamp',login.getPwParams);
App.get('/register',login.getPwSet);
App.post('/register',login.postPwSet);

App.get('/password_reset',login.getPwReset);
App.post('/password_reset',login.postPwReset);

App.get('/login',login.getLogin);
App.post('/login',login.postLogin);

App.get('/logout', function(req,res){
  req.session.destroy();
  res.redirect('/login');
});

App.get('/img/logo.png',function(req,res){
  res.sendFile(__dirname+'/public/logo.png');
});

App.get('/track/:email/:date/pixel.png',email.track);

App.get('/error',function(req,res){
  if(!req.session.user){
    req.session.fromURL = 'reports/individual';
    res.redirect('/login');
  }
  else{
    res.send(templates.error_template.expand({}));
  }
});

App.use(function(req,res,next){
  if(!req.session.user){
    req.session.fromURL = req.url;
    res.redirect('/login');
  }else{
    next();
  }
});

App.get('/account/switch-client',login.getClientSelection);
App.post('/account/switch-client',login.postClientSelection);

App.use(function(req,res,next){
  if(!req.session.client){
    req.session.fromURL = req.url;
    res.redirect('/account/switch-client');
  }else{
    next();
  }
});

App.use(function(req,res,next){
  console.log(req.session.user.pages.indexOf(trim(req.path,'/')))
  if(req.session.user.pages.indexOf(trim(req.path,'/'))>-1){
    next();
  }else if(req.method==="POST"){
    next();
  }
  else{
    res.redirect('/');
  }
});

App.get('/',function(req,res){
  res.send(templates.template.expand({
    title:app.app_title+" - Home",
    js:"./js/home.js"
  }));
});

App.get('/settings/:page',settings.getSettings);
App.post('/settings/:action/:object',settings.postSettings);

App.get('/email/:page',email.getEmail);
App.post('/email/send',email.postEmail);
App.get('/reports/:report',reports.getReports);

App.get('/auth/:site/url',auth.getAuthUrl);
App.get('/gm/auth',auth.saveTokens);

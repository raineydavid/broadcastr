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
    )
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
    emailSend = require('./emailSend'),
    parse = require('./parse'),
    serviceAccount = require("./echo-email-7c3f6c3d45e1.json");
    error = require('./error');
    require('dotenv').config();

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
    root = db.ref(),
    queue = db.ref('/queue'),
    options = {endpoint: "jobs"},
    cron = new fbCron(root,queue,options);

//Google API Setup
var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2('861801325411-88uiq1nodmq0a1mqdcp4g3gb4lqeqc1k.apps.googleusercontent.com','AHxHWl5HayoqX7QaUBzOIZ5b',process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1');

google.options({auth: oauth2Client})

pg.defaults.poolSize = 50;

if (process.env.REDISTOGO_URL) {
    var rtg   = url.parse(process.env.REDISTOGO_URL);
    var redClient = redis.createClient(rtg.port, rtg.hostname);
    redClient.auth(rtg.auth.split(":")[1]);
} else {
      var redClient = redis.createClient();
}

var app = express();

app.use(cookieParser());
app.use(bodyParser());
var sessionHandler = session({
  store: new redisStore({ host: 'localhost', port: 6379, client: redClient }),
  secret:'pocket_square'});

app.use(sessionHandler)

var server = http.createServer(app);

var hashids = new Hashids('pocket_square',8);

var jsonParser = bodyParser.json();

var template                           = jsontemplate.Template(fs.readFileSync('./template.jsont').toString()),
    login_template                     = jsontemplate.Template(fs.readFileSync('./login_template.jsont').toString()),
    success_template                   = jsontemplate.Template(fs.readFileSync('./success_template.jsont').toString()),
    error_template                     = jsontemplate.Template(fs.readFileSync('./error.jsont').toString());

var rollback = function(client, done) {
    client.query('ROLLBACK', function(err) {
    return done(err);
  });
};

var database = process.env.DATABASE_URL

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

app.use(express.static(__dirname + '/public'));

// Return the Let's Encrypt certbot response:
/*
app.get('/.well-known/acme-challenge/:content', function(req, res) {
  res.send(letsEncryptReponse);
});
*/
/*
app.get('*',function(req,res,next){
  if(req.path==="/login"||req.path==="/password_reset"||req.path.indexOf("register")>-1){
    next()
  }else{
    if(req.session.userID){
      if(req.session.page_access.indexOf(req.path)!=-1){
        if(process.env.STATE==="prod"){
          if(req.headers['x-forwarded-proto']!='https'){
            res.redirect('https://'+process.env.REDIRECT_URL+req.url)
          }else{
            next()
          }
        }else{
          next()
        }
      }else{
        if(process.env.STATE==="prod"){
          res.redirect('https://'+process.env.REDIRECT_URL+"/workweek_hours")
        }else{
          res.redirect('/workweek_hours')
        }
      }
    }else{
      if(process.env.STATE==="prod"){
        res.redirect('https://'+process.env.REDIRECT_URL+"/login")
      }else{
        res.redirect('/login')
      }
    }
  }
})
*/

app.get('/img/echo_logo.png',function(req,res){
  res.sendFile(__dirname+'/public/echo_logo.png')
})

app.get('/track/:email/:date/pixel.png',function(req,res){
  var decoded_email = Buffer(hashids.decodeHex(req.params.email),'hex').toString('utf8'),
      decoded_date = hashids.decode(req.params.date)[0];

  pg.connect(database,function(dbErr,client,done){
    if(dbErr){console.log(dbErr)}else{
      async.waterfall([
        function(callback){
          client.query("SELECT sender_id,sender_email,body FROM echo.activity_logs WHERE datecode = $1 AND recipient_email = $2",[decoded_date,decoded_email],function(err,result){
            if(err){callback(err)}{
              callback(err,result.rows[0])
            }
          })
        },
        function(result,callback){
          client.query("INSERT INTO echo.activity_logs (timestamp,datecode,sender_id,sender_email,body,recipient_email,action) VALUES (current_timestamp,$1,$2,$3,$4,$5,'open')",[decoded_date,result.sender_id,result.sender_email,result.body,decoded_email],function(dbErr){
            callback(dbErr)
          })
        }
      ],function(err){
        if(err){console.log(err)}
        res.sendFile(__dirname+'/pixel.png')
      })
    }
  })
})

app.get('/login', function(req,res){
  if(req.session.user){
    res.redirect('/')
  }else{
    if(req.session.loginFail){
      failMsg = true
    }else{failMsg=false}
    res.send(
      login_template.expand({
        failMsg: failMsg
      }));
  }
});

app.post('/login', function(req,res){
  firebase.auth().signInWithEmailAndPassword(req.body.email,req.body.password)
      .then(function(user){
        admin.auth().createCustomToken(user.uid)
          .then(function(customToken){
            db.ref('/users/'+user.uid).once("value",function(snapshot){
              req.session.user=snapshot.val()
              req.session.user.id = user.uid
              if(snapshot.val().tokens){
                res.redirect('/')
              }else{
                res.redirect('/#newUser')
              }
            })
          })
          .catch(function(error){
            console.log("Error creating custom token:", error);
          });
      })
      .catch(function(error){
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/wrong-password'){
          console.log('Wrong password');
        }else{
          console.log(errorMessage);
        }
        console.log(error);
      });
});

app.get('/error',function(req,res){
  if(!req.session.user){
    req.session.fromURL = 'reports/individual'
    res.redirect('/login')
  }
  else{
    res.send(error_template.expand({}));
  }
})

app.get('/',function(req,res){
  if(req.session.user){
    res.send(template.expand({
      title:"Echo - Home",
      js:"/javascripts/home.js"
    }))
  }else{
    res.redirect('/login')
  }
})

app.get('/email/:page',function(req,res){
  if(req.session.user){
    switch(req.params.page){
      case "send":
        res.send(template.expand({
          title:"Echo - Send Email",
          js:"/javascripts/email/send.js"
        }))
      break;
    }
  }else{
    res.redirect('/login')
  }
})

app.post('/email/send',function(req,res){
  switch(req.body.headerSelect){
    case "default":
      db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
        var user = snapshot.val()
        user.id = req.session.user.id
        queue.create('email',{
          user:user,
          recip:arrayToObjects(parse.CSVToArray(req.body.recipients,"\t"),['email','name']).filter(function(d){return d.email!=""}),
            mergeFields:[{merge:"|*NAME*|",key:"name"},{merge:"|*EMAIL*|",key:"email"}],
          subj:req.body.subject,
          body:req.body.body,
        }).save(function(err){
          if(err){console.log(err)}
          res.redirect('/email/send')
        })
      })
    break;
    case "custom":
      db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
        var user = snapshot.val()
        user.id = req.session.user.id
        queue.create('email',{
          user:user,
          recip:arrayToObjects(parse.CSVToArray(req.body.recipients).slice(1),parse.CSVToArray(req.body.recipients)[0]).filter(function(d){return d.email!=""}),
          mergeFields:parse.CSVToArray(req.body.recipients)[0].map(function(d){return {merge:"|*"+d.toUpperCase()+"*|",key:d}}),
          subj:req.body.subject,
          body:req.body.body,
        }).save(function(err){
          if(err){console.log(err)}
          res.redirect('/email/send')
        })
      })
    break;
  }
})

app.get('/reports/:report',function(req,res){
  if(req.session.user){
    switch(req.params.report){
      case "topline":
        res.send(template.expand({
          title:"Echo - Topline Report",
          js:"/javascripts/reports/topline.js"
        }))
      break;
    }
  }else{
    res.redirect('/login')
  }
})

app.get('/settings/:page',function(req,res){
  if(req.session.user){
    switch(req.params.page){
      case "me":
        res.send(template.expand({
          title:"Echo - My Account",
          js:"/javascripts/settings/me.js"
        }))
      break;
      case "users":
        res.send(template.expand({
          title:"Echo - Users",
          js:"/javascripts/settings/users.js"
        }))
      break;
      case "clients":
        res.send(template.expand({
          title:"Echo - Clients",
          js:"/javascripts/settings/clients.js"
        }))
      break;
      case "templates":
        res.send(template.expand({
          title:"Echo - Templates",
          js:"/javascripts/settings/templates.js"
        }))
      break;
    }
  }else{
    res.redirect('/login')
  }
})

app.get('/gm/auth/url',function(req,res){
  var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://mail.google.com/']
          });

          res.redirect(url)
})

app.get('/gm/auth',function(req,res){
  oauth2Client.getToken(req.query.code,function(err, tokens){
      if(err) {
        console.log(err)
        return;
      }else{
        async.series({
          oauth:function(callback){
            oauth2Client.setCredentials(tokens)
            console.log(tokens)
            callback()
          },
          access_token:function(callback){
            if(tokens.access_token){
              db.ref('/users/'+req.session.user.id+"/tokens/access_token").set(tokens.access_token)
              callback(null,tokens.access_token)
            }else{
              db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
                callback(null,snapshot.val().tokens.access_token)
              })
            }
          },
          refresh_token:function(callback){
            if(tokens.refresh_token){
              db.ref('/users/'+req.session.user.id+"/tokens/refresh_token").set(tokens.refresh_token)
              callback(null,tokens.refresh_token)
            }else{
              db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
                callback(null,snapshot.val().tokens.refresh_token)
              })
            }
          }
        },function(err,data){
          req.session.tempToken = data
          res.redirect('/')
        })
      }
    })
})

app.get('/logout', function(req,res){
  req.session.destroy();
  res.redirect('/login');
});

var port = process.env.PORT || 5000

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection",function(ws){
  var req = ws.upgradeReq;
  var res = {writeHead: {}};
  sessionHandler(req,res,function(err){
    db.ref('/pages').once('value',function(snapshot){
      ws.send(JSON.stringify({id:"pages",data:snapshot.val()}))
    })
    ws.on("message",function(d){
      switch(JSON.parse(d).type){
        case "email":
          switch(JSON.parse(d).id){
            case "templates":
              db.ref('/templates').once('value',function(snapshot){
                if(snapshot.val()){
                  ws.send(JSON.stringify({id:"templates",data:{templates:snapshot.val().map(function(d){return snapshot.val()[d]})}}))
                }else{
                  ws.send(JSON.stringify({id:"templates",data:{templates:[]}}))
                }
              })
            break;
          }
        break;
        case "reports":
          switch(JSON.parse(d).id){
            case "topline":
              pg.connect(database,function(err,client,done){
                async.series({
                  totals:function(callback){
                    client.query("SELECT COUNT(DISTINCT datecode),COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END)::FLOAT/COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as unique_open_rate,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM echo.activity_logs WHERE sender_id = $1",[req.session.user.id],function(err,result){
                      if(result){
                        callback(err,result.rows)
                      }else{
                        callback(err)
                      }
                    })
                  },
                  timeSeries:function(callback){
                    client.query("select (substring(datecode from 5 for 2)||'/'||substring(datecode from 7 for 2)||'/'||substring(datecode from 1 for 4)) as send_date,COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM echo.activity_logs WHERE sender_id = $1 GROUP BY send_date",[req.session.user.id],function(err,result){
                      if(result){
                        callback(err,result.rows)
                      }else{
                        callback(err)
                      }
                    })
                  }
                },function(err,data){
                  ws.send(JSON.stringify({id:"data",data:data}))
                })
              })
            break;
          }
        break;
        case "settings":
          switch(JSON.parse(d).id){
            case "me":
              db.ref('/users'+req.session.user.id).once('value',function(snapshot){
                ws.send(JSON.stringify({id:"data",data:snapshot.val()}))
              })
            break;
            case "users":
              db.ref('/users').once('value',function(snapshot){
                if(snapshot.val()){
                  ws.send(JSON.stringify({id:"data",data:objectToArray(snapshot.val())}))
                }else{
                  ws.send(JSON.stringify({id:"data",data:[]}))
                }
              })
            break;
            case "clients":
              db.ref('/clients').once('value',function(snapshot){
                if(snapshot.val()){
                  ws.send(JSON.stringify({id:"data",data:objectToArray(snapshot.val())}))
                }else{
                  ws.send(JSON.stringify({id:"data",data:[]}))
                }
              })
            break;
            case "templates":
              db.ref('/templates').once('value',function(snapshot){
                if(snapshot.val()){
                  ws.send(JSON.stringify({id:"data",data:objectToArray(snapshot.val())}))
                }else{
                  ws.send(JSON.stringify({id:"data",data:[]}))
                }
              })
            break;
          }
        break;
      }
    })

  ws.on("close", function() {
    console.log("websocket connection close")
  })
})
})

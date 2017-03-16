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

app.get('/',function(req,res){
  if(req.session.user){
    res.send(template.expand({
      title:"Echo - Send Email",
      js:"/javascripts/send.js"
    }))
  }else{
    res.redirect('/login')
  }
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
                res.redirect('/#newUser')
              }else{
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

app.post('/send',function(req,res){
  db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
    emailSend.send(snapshot.val(),arrayToObjects(parse.CSVToArray(req.body.recipients,"\t"),['email','name']).filter(function(d){return d.email!=""}),req.body.subject,req.body.body,function(emailErr,tokenError,newTokens){
      if(emailErr){console.log(emailErr)}
      if(tokenError){console.log(tokenError)}
      db.ref('/users/'+req.session.user.id+"/tokens").set(newTokens)
      res.redirect('/')
    })
  })
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

    })

  ws.on("close", function() {
    console.log("websocket connection close")
  })
})
})

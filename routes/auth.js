var include       = require('../include').include,
    google        = require('googleapis'),
    client        = include('/lib/database'),
    App           = include('/routes/app'),
    templates     = include('/routes/templates').templates;

//Google API Setup
var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1');
    google.options({auth: oauth2Client});

exports.getAuthUrl = function(req,res){
  console.log("INFO - Gmail Auth Started");
  var url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://mail.google.com/']
          });

          res.redirect(url);
};

exports.saveTokens = function(req,res){
  oauth2Client.getToken(req.query.code,function(err, tokens){
      if(err) {
        console.log(err);
        return;
      }else{
        client.connect(function(err,instance,done){
          async.series({
            type:function(callback){
              instance.query("BEGIN",function(err){
                callback(err,"gmail");
              });
            },
            oauth:function(callback){
              oauth2Client.setCredentials(tokens);
              callback();
            },
            access_token:function(callback){
              if(tokens.access_token){
                instance.query("INSERT INTO "+client.schema+".creds (user_id,type,access_token)  VALUES ($1,$2,$3)",[req.session.user.user_id,'gmail',tokens.access_token],function(err){
                  console.log("INFO - OAuth Granted (Access Token)");
                  callback(null,tokens.access_token);
                });
              }else{
                instance.query("SELECT access_token FROM "+client.schema+".creds WHERE user_id = $1 AND type = 'gmail'",[req.session.user.user_id],function(err,token){
                  console.log("INFO - Got Access Token From Postgres");
                  callback(null,token.rows[0].access_token);
                });
              }
            },
            refresh_token:function(callback){
              if(tokens.refresh_token){
                instance.query("INSERT INTO "+client.schema+".creds (user_id,type,refresh_token)  VALUES ($1,$2,$3)",[req.session.user.user_id,'gmail',tokens.refresh_token],function(err){
                  console.log("INFO - OAuth Granted (Refresh Token)");
                  callback(null,tokens.refresh_token);
                });
              }else{
                instance.query("SELECT refresh_token FROM "+client.schema+".creds WHERE user_id = $1 AND type = 'gmail'",[req.session.user.user_id],function(err,token){
                  console.log("INFO - Got Refresh Token From Postgres");
                  callback(null,token.rows[0].refresh_token);
                });
              }
            }
          },function(err,data){
            req.session.user.tokens = data;
            res.redirect('/');
          });
        });
      }
    });
};
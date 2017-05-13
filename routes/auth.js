var google        = require('googleapis'),
    App           = require('../routes/app'),
    templates     = require('../routes/templates').templates;

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
        async.series({
          oauth:function(callback){
            oauth2Client.setCredentials(tokens);
            callback();
          },
          access_token:function(callback){
            if(tokens.access_token){
              FBApp.db.ref('/users/'+req.session.user.id+"/tokens/access_token").set(tokens.access_token)
              console.log("INFO - OAuth Granted (Access Token)")
              callback(null,tokens.access_token)
            }else{
              FBApp.db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
                console.log("INFO - Got Access Token From Firebase")
                callback(null,snapshot.val().tokens.access_token)
              })
            }
          },
          refresh_token:function(callback){
            if(tokens.refresh_token){
              FBApp.db.ref('/users/'+req.session.user.id+"/tokens/refresh_token").set(tokens.refresh_token)
              console.log("INFO - OAuth Granted (Refresh Token)")
              callback(null,tokens.refresh_token)
            }else{
              FBApp.db.ref('/users/'+req.session.user.id).once("value",function(snapshot){
                console.log("INFO - Got Refresh Token From Firebase")
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
}

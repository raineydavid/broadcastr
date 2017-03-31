var fs               = require('fs'),
    nodemailer       = require('nodemailer'),
    async            = require('async'),
    pg               = require('pg'),
    Hashids          = require('hashids'),
    dateformat       = require('dateformat'),
    internetMessage = require('internet-message'),
    Base64           = require('js-base64').Base64;
    google           = require('googleapis');
    require('dotenv').config();

//Google API Setup
var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2('861801325411-88uiq1nodmq0a1mqdcp4g3gb4lqeqc1k.apps.googleusercontent.com','AHxHWl5HayoqX7QaUBzOIZ5b',process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1');

google.options({auth: oauth2Client})

var database = process.env.DATABASE_URL

var objectToArray = function(input){
    return Object.keys(input).map(function(d){
      return input[d]
    })
}

var hashids = new Hashids('pocket_square',8);

exports.send = function(user,recip,mergeFields,subj,body,callback){
  var errorCount = 0,
      sendCount = 0;

pg.connect(database,function(err,client,done){
  async.series([
    function(tokenCb){
      oauth2Client.setCredentials({
        refresh_token: user.tokens.refresh_token
      })

      oauth2Client.refreshAccessToken(function(tokenError,newTokens){
        tokenCb(tokenError,newTokens)
      })
    },
    function(tokenCb){
      async.eachLimit(recip,1,function(d,callback){
        var emailTrack = hashids.encodeHex(Buffer(d.email).toString('hex')),
            uncodedDate = dateformat(Date.now(),"yyyymmddHHMM"),
            dateTrack = hashids.encode(uncodedDate),
            uniqueBody = body

        mergeFields.forEach(function(merge){
          uniqueBody = uniqueBody.replace(merge.merge,d[merge.key])
        })

        async.series([
          function(seriesCb){
            var msg = new internetMessage({
              "Content-Type":"text/html",
              "MIME-Version":"1.0",
              from:user.email,
              to:d.email,
              subject:subj
            },uniqueBody.replace(/href="([^\'\"]+)/gi,function(match,a,b,c){
              return match + "?utm_medium=email&utm_source=echo&utm_term="+emailTrack+"_"+dateTrack
            })+'<br><br><img src="http://echo-email.herokuapp.com/track/'+emailTrack+'/'+dateTrack+'/pixel.png">')

            console.log(uniqueBody.replace(/href="([^\'\"]+)/gi,function(match,a,b,c){
              return match + "?utm_medium=email&utm_source=echo&utm_term="+emailTrack+"_"+dateTrack
            })+'<br><br><img src="http://echo-email.herokuapp.com/track/'+emailTrack+'/'+dateTrack+'/pixel.png">')

            gmail.users.messages.send({
              auth:oauth2Client,
              userId:"me",
              resource:{
                raw:Base64.encodeURI(msg)
              }
            },function(emailErr){
              if(emailErr){
                errorCount++
              }else{
                sendCount++
              }
              if(emailErr){console.log(emailErr)}
              seriesCb(emailErr)
            })
          },
          function(seriesCb){
            client.query("INSERT INTO echo.activity_logs (timestamp,datecode,sender_id,sender_email,body,recipient_email,action) VALUES (current_timestamp,$1,$2,$3,$4,$5,'send')",[uncodedDate,user.id,user.email,uniqueBody,d.email],function(queryErr){
              if(queryErr){console.log(queryErr)}
              seriesCb(queryErr)
            })
          },
        ],function(emailErr){
          if(emailErr){console.log(emailErr)}
          setTimeout(function(){callback(emailErr)},1000)
        })

      },function(emailErr){
        done();
        tokenCb(emailErr)
      })
    }
  ],function(tokenErr,tokens){
    callback(tokenErr,tokens[0],errorCount,sendCount)
  })
})
}

var include          = require('../include').include,
    dbClient         = include('/lib/database'),
    fs               = require('fs'),
    async            = require('async'),
    Hashids          = require('hashids'),
    dateformat       = require('dateformat'),
    internetMessage  = require('internet-message'),
    Base64           = require('js-base64').Base64,
    {google}         = require('googleapis');
    require('dotenv').config();

//Google API Setup
var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1');

google.options({auth: oauth2Client})

var objectToArray = function(input){
    return Object.keys(input).map(function(d){
      return input[d]
    })
}

var hashids = new Hashids('pocket_square',8);

exports.send = function(user,client,recip,mergeFields,subj,body,callback){
  var errorCount = 0,
      sendCount = 0;

  dbClient.query("SELECT * FROM broadcastr.creds WHERE user_id = $1 AND type = 'gmail'",[user.user_id],function(err,tokens){
    var tokens = tokens.rows[0]

    async.series([
      function(tokenCb){
        oauth2Client.setCredentials({
          refresh_token: tokens.refresh_token
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
                from:user.fname+" "+user.lname+" <"+user.email+">",
                to:d.email,
                subject:subj
              },uniqueBody.replace(/href="([^\'\"]+)/gi,function(match,a,b,c){
                return match + "?utm_medium=email&utm_source=broadcastr&utm_term="+emailTrack+"_"+dateTrack
              })+'<br><br><img src="http://broadcastr.herokuapp.com/track/'+emailTrack+'/'+dateTrack+'/pixel.png">')

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
              dbClient.query("INSERT INTO broadcastr.activity_logs (timestamp,datecode,sender_id,sender_email,body,recipient_email,action,client_id) VALUES (current_timestamp,$1,$2,$3,$4,$5,'send',$6)",[uncodedDate,user.id,user.email,uniqueBody,d.email,client.client_id],function(queryErr){
                if(queryErr){console.log(queryErr)}
                seriesCb(queryErr)
              })
            },
          ],function(emailErr){
            if(emailErr){console.log(emailErr)}
            setTimeout(function(){callback(emailErr)},1000)
          })

        },function(emailErr){
          tokenCb(emailErr)
        })
      }
    ],function(tokenErr,newTokens){
      callback(tokenErr,newTokens[0],errorCount,sendCount)
    })

  })
}

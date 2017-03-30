var fs           = require('fs'),
    nodemailer   = require('nodemailer'),
    async        = require('async'),
    pg           = require('pg'),
    Hashids      = require('hashids'),
    dateformat   = require('dateformat'),
    google       = require('googleapis');
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

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type:"OAuth2",
    clientId:"861801325411-88uiq1nodmq0a1mqdcp4g3gb4lqeqc1k.apps.googleusercontent.com",
    clientSecret:"AHxHWl5HayoqX7QaUBzOIZ5b"
  }
});

exports.send = function(user,recip,mergeFields,subj,body,callback){
  var errorCount = 0,
      sendCount = 0;

  async.eachLimit(recip,1,function(d,callback){
    console.log(d.email)
    var emailTrack = hashids.encodeHex(Buffer(d.email).toString('hex')),
        uncodedDate = dateformat(Date.now(),"yyyymmddHHMM"),
        dateTrack = hashids.encode(uncodedDate),
        uniqueBody = body

    mergeFields.forEach(function(merge){
      uniqueBody = uniqueBody.replace(merge.merge,d[merge.key])
    })

    async.series([
      function(seriesCb){
        transporter.sendMail({
          from:user.email,
          to:d.email,
          subject:subj,
          html:uniqueBody+'<br><br><img src="http://echo-email.herokuapp.com/track/'+emailTrack+'/'+dateTrack+'/pixel.png">',
          auth:{
            user:user.email,
            refreshToken:user.tokens.refresh_token,
            accessToken:user.tokens.access_token
          }
        },function(emailErr){
          if(emailErr){
            errorCount++
          }else{
            sendCount++
          }
          console.log(sendCount)
          if(emailErr){console.log(emailErr)}
          seriesCb(emailErr)
        })
      },
      function(seriesCb){
        pg.connect(database,function(dbErr,client,done){
          if(dbErr){seriesCb(dbErr)}else{
            console.log(d.name)
            client.query("INSERT INTO echo.activity_logs (timestamp,datecode,sender_id,sender_email,body,recipient_email,action) VALUES (current_timestamp,$1,$2,$3,$4,$5,'send')",[uncodedDate,user.id,user.email,uniqueBody,d.email],function(queryErr){
              seriesCb(queryErr)
            })
          }
        })
      },
    ],function(emailErr){
      if(emailErr){console.log(emailErr)}
      callback(emailErr)
    })

  },function(emailErr){
    oauth2Client.setCredentials({
      refresh_token: user.tokens.refresh_token
    })
    oauth2Client.refreshAccessToken(function(tokenError,newTokens){
      callback(emailErr,tokenError,newTokens,errorCount,sendCount)
    })
  })
}

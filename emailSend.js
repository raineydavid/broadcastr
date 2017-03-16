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

exports.send = function(user,recip,subj,body,callback){
  async.eachLimit(recip,1,function(d,callback){
    var emailTrack = hashids.encodeHex(Buffer(d.email).toString('hex')),
        dateTrack = hashids.encode(dateformat(Date.now(),"YYYYMMDD"))

        console.log(emailTrack)
        console.log(dateTrack)
    async.series([
      function(seriesCb){
        transporter.sendMail({
          from:user.email,
          to:d.email,
          subject:subj,
          html:body.replace("|*NAME*|",d.name)+'<img src="http://echo-email.herokuapp.com/track/'+emailTrack+'/'+dateTrack+'/pixel.png">',
          auth:{
            user:user.email,
            refreshToken:user.tokens.refresh_token,
            accessToken:user.tokens.access_token
          }
        },function(emailErr){
          seriesCb(emailErr)
        })
      },
      function(seriesCb){
        seriesCb()
      },
    ],function(emailErr){
      callback(emailErr)
    })

  },function(emailErr){
    oauth2Client.setCredentials({
      refresh_token: user.tokens.refresh_token
    })
    oauth2Client.refreshAccessToken(function(tokenError,newTokens){
      callback(emailErr,tokenError,newTokens)
    })
  })
}

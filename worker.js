var client      = require('./lib/database'),
    emailSend   = require('./lib/emailSend'),
    app         = require('./routes/app')
    google      = require('googleapis');
    require('dotenv').config();

app.queue.process('email',function(job,done){
  console.log("INFO - "+job.data.user.email + " Send Started")
  emailSend.send(job.data.user,job.data.client,job.data.recip,job.data.mergeFields,job.data.subj,job.data.body,function(tokenError,newTokens){
    if(tokenError){console.log(tokenError)}
    client.query("UPDATE "+client.schema+".creds SET access_token = $1,refresh_token = $2 WHERE user_id = $3 AND type='gmail'",[newTokens.access_token,newTokens.refresh_token,job.data.user.user_id],function(err){
      if(err){
        console.log(err)
        console.log("ERROR - Update Tokens")
      }
      done();
      console.log("INFO - "+job.data.user.email + " Send Done")
    })
  })
})

var include     = require('include').include,
    client      = include('/lib/database'),
    google      = require('googleapis');
    kue         = require('kue'),
    queue       = kue.createQueue(
                    {redis:process.env.REDISTOGO_URL}),
    require('dotenv').config();

if (process.env.REDISTOGO_URL) {
    var rtg   = url.parse(process.env.REDISTOGO_URL);
    var redClient = redis.createClient(rtg.port, rtg.hostname);
    redClient.auth(rtg.auth.split(":")[1]);
} else {
      var redClient = redis.createClient();
}

queue.process('email',function(job,done){
  console.log("INFO - "+job.data.user.email + " Send Started")
  emailSend.send(job.data.user,job.data.client,job.data.recip,job.data.mergeFields,job.data.subj,job.data.body,function(tokenError,newTokens){
    if(tokenError){console.log(tokenError)}
    client.query("UPDATE "+client.schema+".creds SET access_token = $1,refresh_token = $2 WHERE user_id = $3,type='gmail'",[newTokens.access_token,newTokens.refresh_token,job.data.user.user_id],function(err){
      if(err){
        console.log(err)
        console.log("ERROR - Update Tokens")
      }
      done()
      console.log("INFO - "+job.data.user.email + " Send Done")
    })
  })
})

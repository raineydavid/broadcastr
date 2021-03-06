var include       = require('../../include').include,
    path          = require('path'),
    async         = require('async'),
    Hashids       = require('hashids'),
    hashids       = new Hashids('pocket_square',8),
    App           = include('/routes/app'),
    queue         = include('/routes/app').queue,
    client        = include('/lib/database'),
    parse         = include('/lib/parse'),
    templates     = include('/routes/templates').templates;


var arrayToObjects = function(input,headers){
  var array = new Array;
  input.forEach(function(row){
    var output = new Object;

    row.forEach(function(col,i){
      output[headers[i]] = col;
    });

    array.push(output);
  });
  return array;
};


exports.getEmail = function(req,res){
  switch(req.params.page){
    case "send":
      if(!req.session.user.creds&&req.query.state!="newUser"){
         res.redirect('/email/send?state=newUser#newUser');
      }else{
        res.send(templates.template.expand({
          title:"Broadcastr - Send Email",
          js:"../js/email/send.js"
        }))
      }
    break;
  }
}

exports.postEmail = function(req,res){
  switch(req.body.headerSelect){
    case "default":
      var user = req.session.user
      queue.create('email',{
        user:user,
        client:req.session.client,
        recip:arrayToObjects(parse.CSVToArray(req.body.recipients,"\t"),['email','name']).filter(function(d){return d.email!=""}),
          mergeFields:[{merge:"|*NAME*|",key:"name"},{merge:"|*EMAIL*|",key:"email"}],
        subj:req.body.subject,
        body:req.body.body,
      }).save(function(err){
        if(err){console.log(err)}
        console.log("INFO - Default Job Queued")
        res.redirect('/email/send')
      })
    break;
    case "custom":
      var user = req.session.user
      queue.create('email',{
        user:user,
        client:req.session.client,
        recip:arrayToObjects(parse.CSVToArray(req.body.recipients).slice(1),parse.CSVToArray(req.body.recipients)[0]).filter(function(d){return d.email!=""}),
        mergeFields:parse.CSVToArray(req.body.recipients)[0].map(function(d){return {merge:"|*"+d.toUpperCase()+"*|",key:d}}),
        subj:req.body.subject,
        body:req.body.body,
      }).save(function(err){
        if(err){console.log(err)}
        console.log("INFO - Custom Job Queued")
        res.redirect('/email/send')
      })
    break;
  }
}

exports.track = function(req,res){
  var decoded_email = Buffer(hashids.decodeHex(req.params.email),'hex').toString('utf8'),
      decoded_date = hashids.decode(req.params.date)[0];

  console.log("INFO - Open Started for "+decoded_email+" from "+decoded_date)

      async.waterfall([
        function(callback){
          client.query("SELECT sender_id,client_id,sender_email,body FROM broadcastr.activity_logs WHERE datecode = $1 AND recipient_email = $2",[decoded_date,decoded_email],function(err,result){
            if(err){callback(err)}{
              console.log("INFO - Send/Recipient Data Found")
              callback(err,result.rows[0])
            }
          })
        },
        function(result,callback){
          if(result){
            client.query("INSERT INTO broadcastr.activity_logs (timestamp,datecode,sender_id,sender_email,body,recipient_email,action,client_id) VALUES (current_timestamp,$1,$2,$3,$4,$5,'open',$6)",[decoded_date,result.sender_id,result.sender_email,result.body,decoded_email,result.client_id],function(dbErr){
              console.log("INFO - Open Logged")
              callback(dbErr)
            })
          }else{
            console.log("WARNING - No sender ID for open")
            callback()
          }
        }
      ],function(err){
        console.log("INFO - Pixel Sent")
        if(err){console.log(err)}
        res.sendFile('pixel.png',{root:path.join(__dirname,'../../')})
      })
}

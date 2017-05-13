var client        = require('./lib/database.js'),
    fs            = require('fs'),
    bcrypt        = require('bcrypt-nodejs'),
    async         = require('async'),
    sql           = fs.readFileSync('./sql/startup.sql').toString().replace(/{SCHEMA}/g,client.schema);

async.waterfall([
  function(callback){
    bcrypt.hash('test',bcrypt.genSaltSync(10),null,function(err,hash){
      if(err){
        console.log("ERROR - Bcrypt Hash");
      }
      callback(err,hash);
    });
  },
  function(hash,callback){
    client.query(sql.replace(/{PASSWORD}/g,hash),function(err){
      if(err){
        console.log("ERROR - Postgres Error");
      }
      callback(err);
    });
  }
],function(err){
  if(err){
    console.log("ERROR - Startup Error");
    console.log(err);
  }else{
    console.log("INFO - Startup Done");
  }
  process.exit();
});

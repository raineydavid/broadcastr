var include       = require('../../include').include,
    client        = include('/lib/database'),
    async         = require('async');
    require('dotenv').config();

exports.me = function(req,cb){
  client.query("SELECT user_id,email,fname,lname FROM "+client.schema+".users WHERE user_id = $1",[req.session.user.user_id],function(err,user){
    return cb(err,user.rows[0]);
  });
};

exports.client = function(req,cb){
  return cb(null,req.session.client);
};

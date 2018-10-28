var include       = require('../../include').include,
    client        = include('/lib/database'),
    FBApp         = include('/lib/firebase'),
    async         = require('async');
    require('dotenv').config();

var schema = process.env.SCHEMA;

exports.users = function(cb){
  client.query("SELECT distinct sender_id,sender_email FROM "+schema+".activity_logs WHERE sender_id is not null AND client_id = $1",[req.session.client.client_id],function(err,users){
    if(users){
      return cb(err,users.rows);
    }else{
      console.log("WARNING - No users in topline report");
      console.log(err);
      return cb(err);
    }
  });
};

exports.totals = function(cb){
  client.query("SELECT sender_id,COUNT(DISTINCT datecode) as \"Email Batches\",COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as \"Emails Sent\",COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as \"Unique Opens\",trunc(COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END)::NUMERIC/COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END)*100,1) ||'%' as \"Unique Open Rate\",COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as \"Opens\" FROM "+schema+".activity_logs WHERE client_id = $1 GROUP BY sender_id",req.session.client.client_id,function(err,result){
    if(result){
      return cb(err,result.rows);
    }else{
      console.log("WARNING - No totals in topline report");
      console.log(err);
      return cb(err);
    }
  });
};

exports.toplines = function(cb){
  client.query("SELECT sender_id,(substring(datecode from 1 for 4)||'-'||substring(datecode from 5 for 2)||'-'||substring(datecode from 7 for 2)) as send_date,COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM "+schema+".activity_logs WHERE client_id = $1 GROUP BY send_date,sender_id ORDER BY send_date",[req.session.client.client_id],function(err,result){
    if(result){
      return cb(err,result.rows);
    }else{
      console.log("WARNING - No timeSeries in topline report");
      console.log(err);
      return cb(err);
    }
  });
};

exports.timeSeries = function(cb){
  client.query("SELECT sender_id,(substring(datecode from 1 for 4)||'-'||substring(datecode from 5 for 2)||'-'||substring(datecode from 7 for 2)) as send_date,COUNT(CASE WHEN action = 'send' THEN recipient_email ELSE null END) as sends,COUNT(DISTINCT CASE WHEN action = 'open' THEN recipient_email ELSE null END) as unique_opens,COUNT(CASE WHEN action = 'open' THEN recipient_email ELSE null END) as opens FROM broadcastr.activity_logs GROUP BY send_date,sender_id ORDER BY send_date",function(err,result){
    if(result){
      return cb(err,result.rows);
    }else{
      console.log("WARNING - No timeSeries in topline report");
      console.log(err);
      return cb(err);
    }
  });
};

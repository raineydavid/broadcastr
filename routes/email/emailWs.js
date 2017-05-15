var include       = require('../../include').include,
    client        = include('/lib/database'),
    FBApp         = include('/lib/firebase'),
    async         = require('async');
    require('dotenv').config();

exports.routes = {
  templates:function(ws){
    FBApp.db.ref('/templates').once('value',function(snapshot){
      if(snapshot.val()){
        ws.send(JSON.stringify({id:"templates",data:{templates:snapshot.val().map(function(d){return snapshot.val()[d]})}}))
      }else{
        ws.send(JSON.stringify({id:"templates",data:{templates:[]}}))
        console.log("WARNING - No Templates (Email Send)")
      }
    })
  }
};

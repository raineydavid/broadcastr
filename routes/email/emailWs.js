var include       = require('../../include').include,
    client        = include('/lib/database'),
    FBApp         = include('/lib/firebase'),
    async         = require('async');
    require('dotenv').config();

exports.routes = {
  templates:function(ws){
      ws.send(JSON.stringify({id:"templates",data:{templates:[]}}));
      console.log("WARNING - No Templates (Email Send)");
  }
};

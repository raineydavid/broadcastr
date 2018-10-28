var include       = require('../../include').include,
    client        = include('/lib/database'),
    async         = require('async');
    require('dotenv').config();

exports.routes = {
  templates:function(cb){
      return cb(null,{templates:[]});
      console.log("WARNING - No Templates (Email Send)");
  }
};

var include       = require('../../include').include,
    client        = include('/lib/database'),
    FBApp         = include('/lib/firebase'),
    async         = require('async');
    require('dotenv').config();

exports.users = function(where,andWhere,cb){
  client.query("SELECT users.user_id,users.fname,users.lname,users.fname||' '||users.lname as name,users.email,access_levels.name as access,access_levels.access_id as access_id,TO_CHAR(users.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,users.disabled,ARRAY_AGG(JSON_OBJECT(ARRAY['client_id','name'],ARRAY[clients.client_id::varchar,clients.name])) as clients FROM "+client.schema+".users LEFT JOIN "+client.schema+".user_access ON user_access.user_id = users.user_id AND user_access.disabled=FALSE LEFT JOIN "+client.schema+".access_levels USING(access_id) LEFT JOIN "+client.schema+".users created ON created.user_id = users.created_by LEFT JOIN "+client.schema+".client_access ON users.user_id = client_access.user_id LEFT JOIN "+client.schema+".clients ON clients.client_id = client_access.client_id AND clients.disabled = FALSE "+andWhere+" GROUP BY users.user_id,users.fname,users.lname,users.email,access_levels.name,access_levels.access_id,users.created_at,created.email,users.disabled",function(err,users){
    if(users){
      return cb(err,users.rows);
    }else{
      console.log("WARNING - No Users (Settings - Users)");
      return cb(err,[]);
    }
  });
};

exports.access = function(req,where,andWhere,cb){
client.query("SELECT access_id as value,access_levels.name as text FROM "+client.schema+".access_levels WHERE CASE WHEN $1 THEN TRUE ELSE admin_only_assign = $1 END",[req.session.client.admin],function(err,access_levels){
  if(access_levels){
    return cb(err,access_levels.rows);
  }else{
    console.log("WARNING - No Access Levels (Settings - Users)");
    return cb(err,[]);
  }
});
};

exports.client = function(where,andWhere,cb){
client.query("SELECT client_id as value,name as text FROM "+client.schema+".clients LEFT Join "+client.schema+".client_access USING(client_id) WHERE clients.disabled = FALSE AND client_access.disabled = FALSE "+andWhere,function(err,clients){
  if(clients){
    return cb(err,clients.rows);
  }else{
    console.log("WARNING - No Clients (Settings - Users)");
    return cb(err,[]);
  }
});
};

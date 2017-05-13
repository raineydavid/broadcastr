var include       = require('../../include').include,
    client        = include('/lib/database'),
    FBApp         = include('/lib/firebase'),
    async         = require('async');
    require('dotenv').config();

exports.clients = function(where,andWhere,cb){
  client.query("SELECT clients.client_id,clients.name,lead.email as twoseventy_lead,lead.user_id as twoseventy_lead_id,TO_CHAR(clients.created_at,'MM/DD/YY HH:MM') as created_at,created.email as created_by,clients.disabled,ARRAY_AGG(JSON_OBJECT(ARRAY['user_id','name','email'],ARRAY[users.user_id::varchar,users.fname||' '||users.lname,users.email])) as users FROM "+client.schema+".clients LEFT JOIN "+client.schema+".users created ON created.user_id = clients.created_by LEFT JOIN "+client.schema+".users lead ON lead.user_id = clients.twoseventy_lead LEFT JOIN "+client.schema+".client_access ON clients.client_id = client_access.client_id AND client_access.disabled = FALSE LEFT JOIN "+client.schema+".users ON users.user_id = client_access.user_id AND users.disabled = FALSE GROUP BY clients.client_id,clients.name,lead.email,lead.user_id,clients.created_at,created.email,clients.disabled",function(err,clients){
    if(clients){
      return cb(err,clients.rows);
    }else{
      console.log("WARNING - No Clients (Settings - Clients)");
      return cb(err,[]);
    }
  });
};

exports.twoseventy_lead = function(where,andWhere,cb){
  client.query("SELECT user_id as value,fname||' '||lname as text FROM "+client.schema+".users LEFT JOIN "+client.schema+".user_access USING(user_id) LEFT JOIN "+client.schema+".access_levels USING(access_id) WHERE access_levels.name = '270 Admin'",function(err,twoseventyLeads){
    if(twoseventyLeads){
      return cb(err,twoseventyLeads.rows);
    }else{
      console.log("WARNING - No 270 Leads (Settings - Clients)");
      return cb(err,[]);
    }
  });
};

exports.user = function(where,andWhere,cb){
  client.query("SELECT user_id as value,fname||' '||lname as text FROM "+client.schema+".users WHERE disabled = FALSE",function(err,users){
    if(users){
      return cb(err,users.rows);
    }else{
      console.log("WARNING - No Users (Settings - Clients)");
      return cb(err,[]);
    }
  });
};

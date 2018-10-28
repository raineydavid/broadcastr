var include       = require('../../include').include,
    client        = include('/lib/database'),
    email         = include('/lib/transactionEmail'),
    App           = include('/routes/app'),
    templates     = include('/routes/templates').templates,
    async         = require('async'),
    Hashids       = require('hashids'),
    hashids       = new Hashids('pocket_square',8);
    require('dotenv').config();

exports.getSettings = function(req,res){
    switch(req.params.page){
      case "users":
        res.send(templates.template.expand({
          title:App.app_title+" - Users",
          js:"../js/settings/users.js"
        }));
      break;
      case "clients":
        res.send(templates.template.expand({
          title:App.app_title+" - Clients",
          js:"../js/settings/clients.js"
        }));
      break;
      case "me":
        res.send(templates.template.expand({
          title:App.app_title+" - My Account",
          js:"../js/settings/me.js"
        }));
      break;
  }
};

exports.postSettings = function(req,res){
  switch(req.params.object){
    case "user":
      switch(req.params.action){
        case "add":
          client.connect(function(err,instance,done){
            console.log("connect");
            async.waterfall([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("INSERT INTO "+client.schema+".users (fname,lname,email,created_at,created_by) VALUES ($1,$2,$3,current_timestamp,$4) ON CONFLICT DO NOTHING RETURNING user_id",[req.body.fname,req.body.lname,req.body.email,req.session.user.user_id],function(err,result){
                  if(err){
                    console.log("ERROR - Postgres Database Create User");
                  }
                  callback(err,result.rows[0].user_id);
                });
              },
              function(user_id,callback){
                instance.query("INSERT INTO "+client.schema+".user_access (user_id,access_id) VALUES ($1,$2)",[user_id,req.body.access],function(err,result){
                  if(err){
                    console.log("ERROR - Postgres Database Create User Access");
                  }
                  callback(err,user_id);
                });
              },
              function(user_id,callback){
                instance.query("INSERT INTO "+client.schema+".client_access (user_id,client_id) VALUES ($1,$2)",[user_id,req.body.client],function(err,result){
                  if(err){
                    console.log("ERROR - Postgres Database Create Client Access");
                  }
                  callback(err,user_id);
                });
              },
              function(user_id,callback){
                email.send(templates.intro_email.expand({
                  title:App.app_title,
                  img:App.url+'/logo',
                  name:req.body.fname,
                  url:App.url+'/register/'+hashids.encode(user_id)+'/'+hashids.encode(Date.now())
                }),
                req.body.email,
                'Welcome to '+App.app_title,
                function(info){
                  console.log("INFO - New User Email Send Complete");
                  console.log(info);
                  callback();
                }
              );
              }
            ],function(err,data){
              if(err){
                console.log("ERROR - settings/create/user");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/users#error');
              }else{
                console.log("INFO - User Successfully Created");
                console.log(req.body.email);
                instance.query("COMMIT");
                done();
                res.redirect('/settings/users');
              }
            });
          });
        break;
        case "update":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".users SET fname = $1,lname = $2,email = $3 WHERE user_id = $4",[req.body.fname,req.body.lname,req.body.email,req.body.user_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Database User Update");
                  }
                  callback(err);
                });
              },
              function(callback){
                if(req.session.user.access_level!=req.body.access){
                  async.series([
                    function(accessCb){
                      instance.query("DELETE FROM "+client.schema+".user_access WHERE user_id = $1",[req.body.user_id],function(err){
                        if(err){
                          console.log("ERROR - Postgres Database User Access Update");
                        }
                        accessCb(err);
                      });
                    },
                    function(accessCb){
                      instance.query("INSERT INTO "+client.schema+".user_access (user_id,access_id) VALUES ($1,$2) ON CONFLICT (user_id,access_id,disabled) DO NOTHING",[req.body.user_id,req.body.access],function(err){
                        if(err){
                          console.log("ERROR - Postgres Database User Access Insert");
                        }
                        accessCb(err);
                      });
                    }
                  ],function(err){
                    callback(err);
                  });
                }else{
                  callback();
                }
              }
            ],function(err,data){
              if(err){
                console.log("ERROR - /settings/update/user");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/users#error');
              }else{
                console.log("INFO - User Successfully Updated");
                instance.query("COMMIT");
                done();
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
        case "delete":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".users SET disabled = TRUE WHERE user_id = $1",[req.body.user_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Disable User");
                  }
                  callback(err);
                });
              }
            ],function(err,data){
              if(err){
                console.log("ERROR - /settings/delete/user");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/users#error');
              }else{
                console.log("INFO - User Successfully Deleted");
                instance.query("COMMIT");
                done();
                res.redirect('/settings/users');
              }
            });
          });
        break;
        case "activate":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".users SET disabled = FALSE WHERE user_id = $1",[req.body.user_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Activate User");
                  }
                  callback(err);
                });
              }
            ],function(err,data){
              if(err){
                console.log("ERROR - /settings/delete/user");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/users#error');
              }else{
                console.log("INFO - User Successfully Activated");
                instance.query("COMMIT");
                done();
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
      }
    break;
    case "user-client":
      switch(req.params.action){
        case "add":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("INSERT INTO "+client.schema+".client_access VALUES ($1,$2) ON CONFLICT (user_id,client_id) DO UPDATE SET disabled = FALSE",[req.body.user_id,req.body.client],function(err){
                  if(err){
                    console.log("ERROR - Postgres Add User-Client");
                  }
                  callback(err);
                });
              }
            ],function(err){
              if(err){
                console.log("ERROR - /settings/add/user-client");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/'+req.query.redirect+'#error');
              }else{
                console.log("INFO - User-Client Successfully Added");
                console.log(req.body.email);
                instance.query("COMMIT");
                done();
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
        case "delete":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                  instance.query("BEGIN",function(err){
                    callback(err);
                  });
              },
              function(callback){
                instance.query("DELETE FROM "+client.schema+".client_access WHERE (client_id,user_id) = ($1,$2)",[req.body.client_id,req.body.user_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Delete User-Client");
                  }
                  callback(err);
                });
              }
            ],function(err){
              if(err){
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/'+req.query.redirect+'#error');
              }else{
                console.log("INFO - Successfully Deleted User-Client");
                instance.query("COMMIT");
                done();
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
      }
    break;
    case "client":
      switch(req.params.action){
        case "add":
          client.connect(function(err,instance,done){
            async.waterfall([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("INSERT INTO "+client.schema+".clients (name,twoseventy_lead,created_at,created_by) VALUES ($1,$2,current_timestamp,$3) RETURNING client_id",[req.body.client_name,req.body.twoseventy_lead,req.session.user.user_id],function(err,client_id){
                  if(err){
                    console.log("ERROR - Postgres Create Client");
                  }
                  callback(err,client_id.rows[0].client_id);
                });
              },
              function(client_id,callback){
                if(parseInt(req.body.twoseventy_lead)===parseInt(req.session.user.user_id)){
                  instance.query("INSERT INTO "+client.schema+".client_access VALUES ($1,$2)",[req.body.twoseventy_lead,client_id],function(err){
                    if(err){
                      console.log("ERROR - Postgres Create Client/Add Access User=Lead");
                    }
                    callback(err);
                  });
                }else{
                  instance.query("INSERT INTO "+client.schema+".client_access VALUES ($1,$2),($3,$2)",[req.body.twoseventy_lead,client_id,req.session.user.user_id],function(err){
                    if(err){
                      console.log("ERROR - Postgres Create Client/Add Access User!=Lead");
                    }
                    callback(err);
                  });
                }
              },
            ],function(err){
              if(err){
                console.log("ERROR - /settings/add/client");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/clients#error');
              }else{
                instance.query("COMMIT");
                done();
                console.log("INFO - Successfully Created Client");
                res.redirect('/settings/clients');
              }
            });
          });
        break;
        case "update":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".clients SET name = $1,twoseventy_lead = $2 WHERE client_id = $3",[req.body.name,req.body.twoseventy_lead,req.body.client_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Update Client");
                  }
                  callback(err);
                });
              },
              function(callback){
                instance.query("INSERT INTO "+client.schema+".client_access (user_id,client_id) VALUES ($1,$2) ON CONFLICT (user_id,client_id) DO UPDATE SET disabled = FALSE",[req.body.twoseventy_lead,req.body.client_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Add 270 Lead Client Access");
                  }
                  callback(err);
                });
              }
            ],function(err){
              if(err){
                console.log("ERROR - /settings/update/client");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/clients#error');
              }else{
                instance.query("COMMIT");
                done();
                console.log("INFO - Successfully Updated Client");
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
        case "delete":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".clients SET disabled = TRUE WHERE client_id = $1",[req.body.client_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Delete Client");
                  }
                  callback(err);
                });
              }
            ],function(err){
              if(err){
                console.log("ERROR - /settings/delete/client");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/clients#error');
              }else{
                instance.query("COMMIT");
                done();
                res.redirect('/settings/clients');
              }
            });
          });
        break;
        case "activate":
          client.connect(function(err,instance,done){
            async.series([
              function(callback){
                instance.query("BEGIN",function(err){
                  callback(err);
                });
              },
              function(callback){
                instance.query("UPDATE "+client.schema+".clients SET disabled = FALSE WHERE client_id = $1",[req.body.client_id],function(err){
                  if(err){
                    console.log("ERROR - Postgres Activate Client");
                  }
                    callback(err);
                });
              }
            ],function(err){
              if(err){
                console.log("ERROR - /settings/activate/client");
                console.log(err);
                instance.query("ROLLBACK");
                done();
                res.redirect('/settings/clients#error');
              }else{
                instance.query("COMMIT");
                done();
                console.log("INFO - Successfully Activated Client");
                res.redirect('/settings/'+req.query.redirect+'?id='+req.body[req.query.id]);
              }
            });
          });
        break;
      }
    break;
  }
};

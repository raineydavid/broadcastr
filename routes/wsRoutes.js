var include       = require('../include').include,
    client        = include('/lib/database'),
    Server        = include('/routes/app').server,
    sessionHandler= include('/routes/app').sessionHandler,
    settings      = include('/routes/settings/settingsWs').routes,
    email         = include('/routes/email/emailWs').routes,
    reports       = include('/routes/reports/reportsWs').routes,
    async         = require('async'),
    wsServer      = require('ws').Server;

var wss = new wsServer({server: Server});
console.log("websocket server created");

var routes = {
  pages:function(req,cb){
    client.query("SELECT lower(replace(page_category_name,' ','')) as id,page_category_name as name,ARRAY_AGG(JSON_OBJECT(ARRAY['name','html'],ARRAY[pages.page_name,pages.link]) ORDER BY pages._order) as pages FROM "+client.schema+".page_categories LEFT JOIN "+client.schema+".pages ON pages.page_category_id = page_categories.page_category_id LEFT JOIN "+client.schema+".page_access ON page_access.page_id = pages.page_id LEFT JOIN "+client.schema+".user_access ON user_access.access_id = page_access.access_id AND user_access.disabled = FALSE WHERE user_id = $1 AND page_categories.display = TRUE AND pages.display = TRUE GROUP BY page_category_name,page_categories._order ORDER BY page_categories._order",[req.session.user.user_id],function(err,pages){
      if(err){
        console.log("ERROR - WS Pages Error");
        console.log(err);
      }
      return cb(null,pages.rows);
    });
  },
  clients:function(req,cb){
    client.query("SELECT client_id as value,name as text FROM "+client.schema+".clients WHERE client_id in (SELECT client_id FROM "+client.schema+".client_access WHERE user_id = $1)",[req.session.user.user_id],function(err,clients){
      if(err){
        console.log("ERROR - WS Clients Error");
        console.log(err);
      }
      return cb(null,clients.rows);
    });
  },
  self:function(req,cb){
    var dataSend = {
      id:req.session.user.user_id,
      fname:req.session.user.fname,
      lname:req.session.user.lname
    };
    return cb(null,dataSend);
  }
};

wss.on("connection",function(ws){
  console.log(ws)
  var req = ws.upgradeReq;
  var res = {writeHead: {}};
  sessionHandler(req,res,function(err){
    routes.pages(req,function(err,data){
      ws.send(JSON.stringify({id:"pages",data:data}));
    });
    ws.on("message",function(d){
      switch(JSON.parse(d).type){
        case "clients":
          routes.clients(req,function(err,data){
            ws.send(JSON.stringify({id:"data",data:data}));
          });
        break;
        case "email":
          switch(JSON.parse(d).id){
            case "templates":
              email.templates(function(err,data){
                ws.send(JSON.stringify({id:"data",data:data}));
              });
            break;
          }
        break;
        case "reports":
          switch(JSON.parse(d).id){
            case "topline":
                async.series({
                  users:function(callback){
                    reports.topline.users(function(err,data){
                      if(err){
                        console.log("ERROR - reports.topline.users")
                      }
                      callback(err,data);
                    });
                  },
                  totals:function(callback){
                    reports.topline.totals(function(err,data){
                      if(err){
                        console.log("ERROR - reports.topline.totals")
                      }
                      callback(err,data);
                    });
                  },
                  timeSeries:function(callback){
                    reports.timeSeries.totals(function(err,data){
                      if(err){
                        console.log("ERROR - reports.topline.timeSeries")
                      }
                      callback(err,data);
                    });
                  }
                },function(err,data){
                  ws.send(JSON.stringify({id:"data",data:data}));
                });
            break;
          }
        break;
        break;
        case "settings":
          if(req.session.client.admin){
            var where = '',
                andWhere = '';
          }else{
            var where = ' WHERE client_access.client_id = ' + req.session.client.client_id,
                andWhere = ' AND client_access.client_id = ' + req.session.client.client_id;
          }
          switch(JSON.parse(d).id){
            case "me":
              settings.me.me(req,function(err,data){
                if(err){
                  console.log("ERROR - Postgres Data Me");
                  console.log("err");
                  console.log("/account/me Websocket");
                }
                ws.send(JSON.stringify({id:"data",data:data}));
              });
            break;
            case "users":
                async.series({
                  users:function(callback){
                    settings.users.users(where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.users.users")
                      }
                      callback(err,data);
                    });
                  },
                  access:function(callback){
                    settings.users.access(req,where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.users.access")
                      }
                      callback(err,data);
                    });
                  },
                  client:function(callback){
                    settings.users.client(req,where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.users.client")
                      }
                      callback(err,data);
                    });
                  },
                  state:function(callback){
                    async.series({
                      me:function(stateCb){
                        settings.me.me(req,function(err,data){
                          if(err){
                            console.log("ERROR - settings.users.me.me")
                          }
                          stateCb(err,data)
                        });
                      },
                      client:function(stateCb){
                        settings.me.client(req,function(err,data){
                          if(err){
                            console.log("ERROR - settings.users.state.client")
                          }
                          stateCb(err,data)
                        });
                      }
                    },function(err,data){
                      callback(err,data)
                    })
                  },

                },function(err,data){
                  if(err){
                    console.log("ERROR - Users Error");
                    console.log(err);
                  }else{
                    ws.send(JSON.stringify({id:"data",data:data}));
                  }
                });
            break;
            case "clients":
                async.series({
                  clients:function(callback){
                    settings.clients.clients(where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.clients.clients")
                      }
                      callback(err,data);
                    });
                  },
                  twoseventy_lead:function(callback){
                    settings.clients.twoseventy_lead(where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.clients.twoseventy_lead")
                      }
                      callback(err,data);
                    });
                  },
                  user:function(callback){
                    settings.clients.user(where,andWhere,function(err,data){
                      if(err){
                        console.log("ERROR - settings.clients.user")
                      }
                      callback(err,data);
                    });
                  },
                  me:function(callback){
                    settings.me.me(req,function(err,data){
                      if(err){
                        console.log("ERROR - settings.clients.me")
                      }
                      callback(err,data);
                    });
                  }
                },function(err,data){
                  if(err){
                    console.log("ERROR - Clients Error");
                    console.log(err);
                  }else{
                    ws.send(JSON.stringify({id:"data",data:data}));
                  }
                });
            break;
          }
        break;
      }
    });

  ws.on("close", function() {
    console.log("websocket connection close");
  });
});
});

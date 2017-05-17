var include       = require('../include').include,
    client        = include('/lib/database.js'),
    App           = include('/routes/app'),
    FBApp         = include('/lib/firebase'),
    error         = include('/lib/error'),
    templates     = include('/routes/templates').templates,
    email         = include('/lib/transactionEmail'),
    async         = require('async'),
    bcrypt        = require('bcrypt-nodejs'),
    Hashids       = require('hashids'),
    hashids       = new Hashids('pocket_square',8);

exports.getLogin = function(req,res){
  res.send(
    templates.login_template.expand({
      title:App.app_title+" - Login"
    }));
};

exports.postLogin = function(req,res){
  client.query("SELECT * FROM "+client.schema+".login($1)",[req.body.email],function(err,login){
    console.log(login.rows)
    if(err||!login){
      console.log("ERROR - Login Error");
      console.log(err);
      error.route(res);
    }else{
      if(login.rowCount===1){
        bcrypt.compare(req.body.password,login.rows[0].password,function(err,match){
          console.log(match)
          if(match){
            req.session.user = login.rows[0];
            res.redirect('/account/switch-client');
          }else{
            console.log("INFO - Bad Password")
            res.redirect('/login#wrongPass');
          }
        });
      }else{
        console.log("INFO - Bad Username")
        res.redirect('/login#wrongPass');
      }
    }
  });
};

exports.getClientSelection = function(req,res){
  res.send(templates.template.expand({
    title:App.app_title+" - Client Selection",
    js:"../js/client_selection.js"
  }));
};

exports.postClientSelection = function(req,res){
    client.query("SELECT client_id,name,admin FROM "+client.schema+".clients WHERE client_id = $1",[req.body.client],function(err,client){
      req.session.client = client.rows[0];
      res.redirect('/')
    });
};

exports.getPwReset = function(req,res){
  res.send(templates.template.expand({
    title:App.app_title+" - Reset Password",
    js:"../js/pw_reset.js"
  }));
};

exports.postPwReset = function(req,res){
  async.waterfall([
    function(callback){
      client.query("SELECT user_id,fname FROM "+client.schema+".users WHERE email = $1",[req.body.email],function(err,user){
        callback(err,user.rows[0]);
      });
    },
    function(user,callback){
      email.send(templates.pw_reset_email.expand({
          title:App.app_title,
          img:App.url+'/logo',
          name:user.fname,
          url:App.url+'/register/'+hashids.encode(user.user_id)+'/'+hashids.encode(Date.now())
        }),
        req.body.email,
        App.app_title+' - Password Reset',
        function(info){
          console.log("INFO - Password Reset Email Send Complete");
          console.log(info);
          callback();
        }
      );
    }
  ],function(err){
    if(err){
      console.log('/pw_reset');
      console.log(err);
      res.redirect('/error');
    }else{
      console.log("INFO - Reset Password Password Completed");
      res.redirect('/login');
    }
  });
};

exports.getPwParams = function(req,res){
  req.session.url_id = req.params.url_id;
  req.session.timestamp = req.params.timestamp;
  res.redirect('/register');
};

exports.getPwSet = function(req,res){
  var decoded_id = hashids.decode(req.session.url_id),
      decoded_timestamp = hashids.decode(req.session.timestamp);

  if(parseInt(decoded_timestamp)>=(Date.now()-86400000)&&parseInt(decoded_timestamp)<=Date.now()){
    res.send(templates.template.expand({
      title:App.app_title+" - Set Password",
      js:"../js/register.js"
    }));
  }else{
    res.send(templates.template.expand({
      title:App.app_title+" - Link Expired",
      js:"../js/register_expired.js"
    }));
  }
};

exports.postPwSet = function(req,res){
  client.connect(function(err,instance,done){
    async.waterfall([
      function(callback){
        instance.query("BEGIN",function(err){
          callback(err);
        });
      },
      function(callback){
        bcrypt.hash(req.body.password,bcrypt.genSaltSync(10),null,function(err,hash){
          if(err){
            console.log("ERROR - Bcrypt Hash");
          }
          callback(err,hash);
        });
      },
      function(pw,callback){
        instance.query("UPDATE "+client.schema+".users SET password = $1 WHERE user_id = $2",[pw,hashids.decode(req.session.url_id)[0]],function(err){
          if(err){
            console.log("ERROR - Postgres Database PW Update");
          }
          callback(err);
        });
      }
    ],function(err){
      if(err){
        console.log('/register');
        console.log(err);
        instance.query("ROLLBACK");
        done();
        res.redirect('/error');
      }else{
        req.session.destroy();
        console.log("INFO - Set Password Completed");
        instance.query("COMMIT");
        done();
        res.redirect('/login');
      }
    });
  });
};

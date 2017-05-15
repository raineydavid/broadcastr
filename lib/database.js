var pg            = require('pg'),
    url           = require('url');
    require('dotenv').config();

pg.defaults.poolSize = 50;

var params        = url.parse(process.env.DATABASE_URL);
    auth          = params.auth.split(':');

var ssl = true;
if(process.env.DATABASE_SSL==="FALSE"){
  ssl = false;
}

var config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl:ssl
};

var schema        = process.env.DATABASE_URL,
    pool          = new pg.Pool(config);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

exports.query = function (text, values, callback) {
  return pool.query(text, values, callback);
};

exports.connect = function (callback) {
  return pool.connect(callback);
};

exports.schema = process.env.SCHEMA;

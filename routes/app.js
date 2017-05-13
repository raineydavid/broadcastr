var express       = require('express'),
    Promise       = require('es6-promise').Promise,
    bodyParser    = require('body-parser'),
    cookieParser  = require('cookie-parser'),
    session       = require('express-session'),
    http          = require('http'),
    redis         = require('redis'),
    redisStore    = require('connect-redis')(session);
    require('dotenv').config();

if (process.env.REDISTOGO_URL) {
    var rtg   = url.parse(process.env.REDISTOGO_URL);
    var redClient = redis.createClient(rtg.port, rtg.hostname);
    redClient.auth(rtg.auth.split(":")[1]);
} else {
      var redClient = redis.createClient();
}

var app = express();

app.use(cookieParser());
app.use(bodyParser());
var sessionHandler = session({
  store: new redisStore({ host: 'localhost', port: 6379, client: redClient }),
  secret:'pocket_square'});
app.use(sessionHandler);
app.use(express.static('./public'));

var port = process.env.PORT || 5000;
var server = http.createServer(app);
server.listen(port);

exports.app = app;
exports.server = server;
exports.app_title = process.env.TITLE;
exports.url = process.env.URL;
exports.sessionHandler = sessionHandler;
console.log("http server listening on %d", port);

var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var routes = require(path.join(__dirname, 'routes/index.js')); // Load routes.
var admin = require(path.join(__dirname, 'routes/admin.js')); // Load Administration routes.

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // Jade templates

app.use(favicon(__dirname + '/public/favicon.ico')); // Favicon
app.use(logger('dev')); // App setup from here on out.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.app.cookie.secret));

// Use MongoDB for session storage if it's inputted and enabled. Otherwise,
// default to MemoryStore.
if (config.mongo.enabled) {
  var mongoose = require('mongoose');
  var murl = 'mongodb://' + config.mongo.user + ':';
  murl = murl + config.mongo.pass + '@' + config.mongo.host;
  murl = murl + (config.mongo.port ? ':' + config.mongo.port : '');
  murl = murl + '/' + config.mongo.name;
  var MONGO_URL = process.env.MONGO_URL || murl;
  var mdbOptions;

  var connectDb = function() {
    mdbOptions = {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    }
    mongoose.connect(MONGO_URL, mdbOptions);
  };
  var MongoStore = require('connect-mongo')(session);
  var mongoStoreOpts = {
    mongooseConnection: mongoose.connection,
    hash: {
      salt: config.mongo.store.salt
    }
  };
  app.use(session({
    store: new MongoStore(mongoStoreOpts),
    secret: config.app.session.secret,
    resave: false,
    saveUninitialized: true,
  }));
} else {
  app.use(session({
    secret: config.app.session.secret,
    resave: false,
    saveUninitialized: true,
  }));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

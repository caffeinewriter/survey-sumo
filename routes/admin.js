var express = require('express');
var router = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '../models/index.js'));
var passport = require('passport');
var LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(
  function(username, password, done) {
    models.User.findOne({
      where: {
        username: username
      }
    }).then(function(user) {
      if (!user) {
        return done(null, false);
      }
      user.checkPassword(password, function(err, isMatch) {
        if (!!err) {
          return done(err);
        } else if (!isMatch) {
          return done(null, false);
        }
        return done(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  models.User.findOne({
    where: {
      id: id
    }
  }).then(function(user) {
    done(null, user);
  });
});

var isAuthenticated = function(req, res, next) {
  if(!req.isAuthenticated()) {
    req.flash('err', 'You need to log in to do that.');
    return res.redirect('/admin/login');
  }
  next();
}

router.get('/setup', function(req, res) {
  models.User.findAll({}).then(function(users) {
    if (!users) {
      res.render('setup', {
        title:'Survey Sumo Setup'
      });
    }
  });
});

router.post('/setup', function(req, res) {
  models.User.findAll({}).then(function(users) {
    if (!users) {
      models.User.create({
        username: req.param('username'),
        password: req.param('password')
      });
      req.flash('info', 'User has been set up. Please log in.');
      return res.redirect('/admin/login');
    }
    req.flash('err', 'There is already a user setup for this instance. Please login instead.');
    return res.redirect('/admin/login');
  });
});

router.get('/login', function(req, res) {

});

router.get('/new/survey', isAuthenticated, function(req, res) {

});

router.post('/new/survey', isAuthenticated, function(req, res) {

});

router.get('/new/user', isAuthenticated, function(req, res) {

});

router.post('/new/user', isAuthenticated, function(req, res) {

});

module.exports = router;

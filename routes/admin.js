var express = require('express');
var router = express.Router();
var path = require('path');
var config = require(path.join(__dirname, '../config.js'));
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
        console.log(isMatch);
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
    req.flash('error', 'You need to log in to do that.');
    return res.redirect('/admin/login');
  }
  next();
}

router.get('/', function(req, res) {
  if(req.isAuthenticated()) {
    res.render('dashboard', {
      title: 'Administration Dashboard | Survey Sumo',
      info: req.flash('info'),
      err: req.flash('err')
    });
  } else {
    res.render('login', {
      title: 'Login | Survey Sumo',
      info: req.flash('info'),
      err: req.flash('err')
    });
  }
});

router.get('/setup', function(req, res) {
  models.User.findAndCount({}).then(function(users) {
    console.log(users.count);
    if (users.count < 1) {
      res.render('setup', {
        title:'Setup | Survey Sumo',
        info: req.flash('info'),
        err: req.flash('err')
      });
    } else {
      req.flash('error', 'There is already a user set up for this instance. Please log in instead.')
      return res.redirect('/admin/login');
    }
  });
});

router.post('/setup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    req.flash('err', 'Username and Password are both required.')
    return res.redirect('/admin/setup')
  }
  models.User.findAndCount({}).then(function(users) {
    if (users.count < 1) {
      models.User.create({
        username: req.body.username,
        password: req.body.password,
        lastLogin: Date.now(),
        failures: 0
      })
      .then(function() {
        req.flash('info', 'User has been set up. Please log in.');
        return res.redirect('/admin/login');
      });
    }
    req.flash('error', 'There is already a user set up for this instance. Please log in instead.');
    return res.redirect('/admin/login');
  });
});

router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Login | Survey Sumo',
    captcha: req.recaptcha,
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin/login',
  failureFlash: 'Invalid username or password.'
}));

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('info', 'You have been successfully logged out.');
  res.redirect('/admin/login');
});

router.get('/dashboard', function(req, res) {
  //TODO: Spiffy up dashboard.
  res.render('dashboard', {
    title: 'Administration Dashboard | Survey Sumo',
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.get('/new/survey', isAuthenticated, function(req, res) {
  res.render('new-survey', {
    title: 'New Survey | Survey Sumo',
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.post('/new/survey', isAuthenticated, function(req, res) {
  //TODO: Save survey
});

router.get('/new/user', isAuthenticated, function(req, res) {
  res.render('new-user', {
    title: 'New User | Survey Sumo',
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.post('/new/user', isAuthenticated, function(req, res) {
  //TODO: Save user.
});

module.exports = router;

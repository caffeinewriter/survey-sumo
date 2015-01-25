var express = require('express');
var router = express.Router();
var path = require('path');
var config = require(path.join(__dirname, '../config.js'));
var models = require(path.join(__dirname, '../models/index.js'));
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt');
var empty = require('is-empty');


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

var genHash = function(password, cb) {
  bcrypt.genSalt(config.app.salt.work, function(err, salt) {
    if (!!err) {
      return cb(err);
    }
    bcrypt.hash(password, salt, function(err, hash) {
      if (!!err) {
        return cb(err);
      }
      return cb(null, hash)
    });
  });
};

var isAuthenticated = function(req, res, next) {
  if(!req.isAuthenticated()) {
    req.flash('err', 'You need to log in to do that.');
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
    if (users.count < 1) {
      res.render('setup', {
        title:'Setup | Survey Sumo',
        info: req.flash('info'),
        err: req.flash('err')
      });
    } else {
      req.flash('err', 'There is already a user set up for this instance. Please log in instead.')
      return res.redirect('/admin/login');
    }
  });
});

router.post('/setup', function(req, res) {
  if (empty(req.body.username) || empty(req.body.password)) {
    req.flash('err', 'Username and Password are both required.')
    return res.redirect('/admin/setup')
  }
  models.User.findAndCount({}).then(function(users) {
    if (users.count < 1) {
      genHash(req.body.password, function (err, passHash) {
        models.User.create({
          username: req.body.username,
          password: passHash,
          lastLogin: Date.now(),
          failures: 0
        })
        .then(function() {
          req.flash('info', 'User has been set up. Please log in.');
          return res.redirect('/admin/login');
        });
      });
    }
    req.flash('err', 'There is already a user set up for this instance. Please log in instead.');
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

router.get('/logout', isAuthenticated, function(req, res) {
  req.logout();
  req.flash('info', 'You have been successfully logged out.');
  res.redirect('/admin/login');
});

router.get('/dashboard', isAuthenticated, function(req, res) {
  //FIXME: Spiffy up dashboard.
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
  if (req.body.answers.length < 2 || empty(req.body.question)) {
    req.flash('err', 'Your survey must have a question and at least two answers.');
  }
  var answers = JSON.stringify(req.body.answers);
  var results = {};
  for(k = 0; k < req.body.answers.length; k++) {
    results[k] = 0;
  }
  results = JSON.stringify(results);
  console.log(req.body.question);
  console.dir(req.body.answers);
  console.log(answers);
  console.log(req.body.type);
  console.log(results);
  models.Survey.create({
    question: req.body.question,
    type: req.body.type,
    answers: answers,
    results: results
  })
  .then(function(survey) {
    survey
    .setUser(req.user)
    .then(function() {
      req.flash('info', 'New survey has been created succesfully.');
      return res.redirect('/admin/dashboard');
    });
  });
});

router.get('/new/user', isAuthenticated, function(req, res) {
  res.render('new-user', {
    title: 'New User | Survey Sumo',
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.post('/new/user', isAuthenticated, function(req, res) {
  if (empty(req.body.username) || empty(req.body.password)) {
    req.flash('err', 'Both a username and a password are required for users.');
    return res.redirect('/admin/new/user')
  }
  //FIXME: Require minimum password length
  genHash(req.body.password, function (err, passHash) {
    models.User.create({
      username: req.body.username,
      password: passHash,
      lastLogin: Date.now(),
      failures: 0
    })
    .then(function() {
      //TODO: User priviledge levels.
      req.flash('info', 'New user has been created.');
      return res.redirect('/admin/dashboard');
    });
  });
});

module.exports = router;

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
      return cb(null, hash);
    });
  });
};

var isAuthenticated = function(req, res, next) {
  if(!req.isAuthenticated()) {
     req.flash('error', 'You need to log in to do that.');
    return res.redirect('/admin/login');
  }
  next();
}

router.get('/', function(req, res) {
  models.User.findAndCount({}).then(function(users) {
    if (users.count < 1) {
      return res.redirect('/admin/setup');
    } else if(req.isAuthenticated()) {
      res.render('dashboard', {
        title: 'Administration Dashboard | Survey Sumo',
        info: req.flash('info'),
        err:  req.flash('error'),
        loggedIn: req.user
      });
    } else {
      res.render('login', {
        title: 'Login | Survey Sumo',
        info: req.flash('info'),
        err:  req.flash('error')
      });
    }
  });
});

router.get('/setup', function(req, res) {
  models.User.findAndCount({}).then(function(users) {
    if (users.count < 1) {
      res.render('setup', {
        title:'Setup | Survey Sumo',
        info: req.flash('info'),
        err:  req.flash('error')
      });
    } else {
       req.flash('error', 'There is already a user set up for this instance. Please log in instead.');
      return res.redirect('/admin/login');
    }
  });
});

router.post('/setup', function(req, res) {
  if (empty(req.body.username) || empty(req.body.password)) {
     req.flash('error', 'Username and Password are both required.');
    return res.redirect('/admin/setup')
  } else if (req.body.password.length < 6) {
     req.flash('error', 'The user\'s password must be at least six characters in length.');
    return res.redirect('/admin/setup');
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
     req.flash('error', 'There is already a user set up for this instance. Please log in instead.');
    return res.redirect('/admin/login');
  });
});

router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Login | Survey Sumo',
    info: req.flash('info'),
    err:  req.flash('error')
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
    err:  req.flash('error'),
    loggedIn: req.user
  });
});

router.get('/new/survey', isAuthenticated, function(req, res) {
  res.render('new-survey', {
    title: 'New Survey | Survey Sumo',
    info: req.flash('info'),
    err:  req.flash('error'),
    loggedIn: req.user
  });
});

router.post('/new/survey', isAuthenticated, function(req, res) {
  if (req.body.answers.length < 2 || empty(req.body.question)) {
     req.flash('error', 'Your survey must have a question and at least two answers.');
  }
  var answers = JSON.stringify(req.body.answers);
  var results = {};
  for(k = 0; k < req.body.answers.length; k++) {
    results[k] = 0;
  }
  results = JSON.stringify(results);
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

router.get('/list/survey', isAuthenticated, function(req, res) {
  models.Survey.findAll({}).then(function(surveys) {
    res.render('list-surveys', {
      title: 'List Surveys | Survey Sumo',
      info: req.flash('info'),
      err:  req.flash('error'),
      surveys: surveys,
      loggedIn: req.user
    });
  });
});

router.get('/results/:surveyId', isAuthenticated, function(req, res) {
  models.Survey.findOne({
    where: {
      id: req.params.surveyId
    }
  }).then(function(survey) {
    var data = [];
    var answers = JSON.parse(survey.answers);
    var results = JSON.parse(survey.results);
    answers.forEach(function(value, key) {
      data[key] = [value, results[key]];
    });
    data = JSON.stringify(data);
    res.render('view-results', {
      title: 'Survey Results | Sumo Survey',
      info: req.flash('info'),
      err:  req.flash('error'),
      survey: survey,
      data: data,
      loggedIn: req.user
    });
  });
});

router.post('/delete/survey', isAuthenticated, function(req, res) {
  models.Survey.findOne({
    where: {
      id: req.body.surveyId
    }
  }).then(function(survey) {
    survey.destroy();
    req.flash('info', 'Survey has been deleted successfully.');
    return res.redirect('/admin/list/survey');
  });
});

router.get('/new/user', isAuthenticated, function(req, res) {
  res.render('new-user', {
    title: 'New User | Survey Sumo',
    info: req.flash('info'),
    err:  req.flash('error'),
    loggedIn: req.user
  });
});

router.post('/new/user', isAuthenticated, function(req, res) {
  if (empty(req.body.username) || empty(req.body.password)) {
     req.flash('error', 'Both a username and a password are required for users.');
    return res.redirect('/admin/new/user');
  } else if (req.body.password.length < 6) {
     req.flash('error', 'The user\'s password must be at least six characters in length.');
    return res.redirect('/admin/new/user');
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

router.get('/list/user', isAuthenticated, function(req, res) {
  models.User.findAll({}).then(function(users) {

    res.render('list-users', {
      title: 'List Users | Survey Sumo',
      info: req.flash('info'),
      err:  req.flash('error'),
      users: users,
      loggedIn: req.user
    });
  });
});

router.get('/edit/user/:userId', isAuthenticated, function(req, res) {
  models.User.findOne({
    where: {
      id: req.params.userId
    }
  }).then(function(user) {
    res.render('edit-user', {
      title: 'Editing User | Survey Sumo',
      info: req.flash('info'),
      err:  req.flash('error'),
      user: user,
      loggedIn: req.user
    });
  });
});

router.post('/edit/user', isAuthenticated, function(req, res) {
  models.User.findOne({
    where: {
      id: req.body.id
    }
  }).then(function(user) {
    if (empty(req.body.username) || (req.body.password.length < 6 && !empty(req.body.password))) {
       req.flash('error', 'The user must have both username, and a password at least six characters in length.');
      return res.redirect('/admin/list/user');
    }
    if (!empty(req.body.username)) {
      user.username = req.body.username;
    }
    if (!empty(req.body.password)) {
      genHash(req.body.password, function(err, passHash) {
        if (!!err) {
           req.flash('error', 'Something went wrong while saving the password for the user.');
          return res.redirect('/admin/edit/'+user.id);
        }
        user.password = passHash;
      });
    }
    user.save();
    req.flash('info', 'The user has been edited successfully.');
    return res.redirect('/admin/list/user')
  });
});

router.post('/delete/user', isAuthenticated, function(req, res) {
  models.User.findOne({
    where: {
      id: req.body.userId
    }
  }).then(function(user) {
    user.destroy();
    req.flash('info', 'User has been deleted successfully.');
    return res.redirect('/list/user');
  });
});

module.exports = router;

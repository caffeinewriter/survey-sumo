var express = require('express');
var router = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '../models/index.js'));
var empty = require('is-empty');


router.get('/', function(req, res) {
  res.render('index', {
    title: 'Survey Sumo',
    info: req.flash('info'),
    err:  req.flash('error'),
    loggedIn: req.user
  });
});

router.get('/answer', function(req, res) {
  if (!req.session.viewed) {
    req.session.viewed = [];
    req.session.save();
  }
  if (req.session.viewed.length < 1) {
    models.Survey.findAll({}).then(function(surveys) {
      var survey = !empty(surveys) ? surveys[Math.floor(Math.random()*surveys.length)] : {id: null};
      req.session.currentSurvey = survey.id ? survey.id : null;
      req.session.save();
      if (survey.id === null) {
        return res.render('done', {
          title: 'All Done | Survey Sumo',
          info: req.flash('info'),
          err:  req.flash('error'),
          loggedIn: req.user
        });
      }
      res.render('answer', {
        title: 'Survey Question | Survey Sumo',
        survey: survey,
        info: req.flash('info'),
        err:  req.flash('error'),
        loggedIn: req.user
      });
    });
  } else {
    models.Survey.findAll({
      where: {
        id: {
          not: req.session.viewed
        }
      }
    }).then(function(surveys) {
      var survey = !empty(surveys) ? surveys[Math.floor(Math.random()*surveys.length)] : {id: null};
      req.session.currentSurvey = survey.id ? survey.id : null;
      req.session.save();
      if (survey.id === null) {
        return res.render('done', {
          title: 'All Done | Survey Sumo',
          info: req.flash('info'),
          err:  req.flash('error')
        });
      }
      res.render('answer', {
        title: 'Survey Question | Survey Sumo',
        survey: survey,
        info: req.flash('info'),
        err:  req.flash('error'),
        loggedIn: req.user
      });
    });
  }
});

router.post('/answer', function(req, res) {
  if (!req.session.currentSurvey) {
    req.flash('error', 'Sorry, we had a problem processing your request.');
    return res.redirect('/answer');
  }
  models.Survey.findOne({
    where: {
      id: req.session.currentSurvey
    }
  }).then(function(survey) {
    var surveyResults = JSON.parse(survey.results);
    if (req.body.answers instanceof Array) {
      req.body.answers.forEach(function(val) {
        surveyResults[val] += 1;
      });
    } else {
      surveyResults[req.body.answers] += 1;
    }

    survey.results = JSON.stringify(surveyResults);
    survey.save().then(function() {
      req.session.viewed.push(req.session.currentSurvey);
      req.session.currentSurvey = null;
      req.session.save();
      res.redirect('/answer');
    });
  });
});

module.exports = router;

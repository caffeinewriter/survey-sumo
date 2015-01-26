var express = require('express');
var router = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '../models/index.js'));


router.get('/', function(req, res) {
  res.render('index', {
    title: 'Survey Sumo',
    info: req.flash('info'),
    err: req.flash('err')
  });
});

router.get('/answer', function(req, res) {
  if (!req.session.viewed) {
    req.session.viewed = [];
    req.session.save();
  }
  if (req.session.viewed.length < 1) {
    models.Survey.findAll({}).then(function(surveys) {
      var survey = surveys ? surveys[Math.floor(Math.random()*surveys.length)] : {id: null};
      console.dir(surveys);
      req.session.currentSurvey = survey.id ? survey.id : null;
      req.session.save();
      if (survey.id === null) {
        return res.render('done', {
          title: 'All Done | Survey Sumo',
          info: req.flash('info'),
          err: req.flash('err')
        });
      }
      res.render('answer', {
        title: 'Survey Question | Survey Sumo',
        survey: survey,
        info: req.flash('info'),
        err: req.flash('err')
      });
    });
  } else {
    models.Survey.find({
      where: {
        id: {
          not: req.session.viewed
        }
      }
    }).then(function(surveys) {
      var survey = surveys ? surveys[Math.floor(Math.random()*surveys.length)] : null;
      req.session.currentSurvey = survey.id ? survey.id : null;
      req.session.save();
      if (!survey) {
        return res.render('done', {
          title: 'All Done | Survey Sumo',
          info: req.flash('info'),
          err: req.flash('err')
        });
      }
      res.render('answer', {
        title: 'Survey Question | Survey Sumo',
        survey: survey,
        info: req.flash('info'),
        err: req.flash('err')
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
    var surveyResults = JSON.parse(survey.votes);
    if (req.body.answers instanceof array) {
      req.body.answers.forEach(function(val) {
        surveyResults[val] += 1;
      });
    } else {
      surveyResults[req.body.answers] += 1;
    }
  });
});

module.exports = router;

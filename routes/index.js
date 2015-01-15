var express = require('express');
var router = express.Router();
var path = require('path');
var models = require(path.join(__dirname, '../models/index.js'));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Survey Sumo' });
});

router.get('/answer', function(req, res) {
  if (!req.session.viewed) {
    req.session.viewed = [];
    req.session.save();
  }
  models.Survey.find({
    where: {
      id: {
        not: req.session.viewed
      }
    }
  });
});

router.post('/answer', function(req, res) {

});

module.exports = router;

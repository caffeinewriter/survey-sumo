var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var Survey = sequelize.define("Survey", {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answers: {
      type: DataTypes.STRING,
      allowNull: false
    },
    votes: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    hooks: {
      beforeValidate: function(survey, options, cb) {
        if (!survey.id) {
          var newId = crypto.createHash('sha1').update(Date.now() + '' + Math.random()).digest('hex').substr(-16);
          survey.id = newId;
          return cb(null, survey);
        }
        return cb(null, survey);
      }
    },
    classMethods: {
      associate: function(models) {
        Survey.belongsTo(models.User);
      }
    }
  });
  return Survey;
}

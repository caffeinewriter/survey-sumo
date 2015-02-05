module.exports = function(sequelize, DataTypes) {
  var Survey = sequelize.define("Survey", {
    question: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['multiple', 'single']
    },
    answers: {
      type: DataTypes.STRING(8192),
      allowNull: false
    },
    results: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Survey.belongsTo(models.User);
      }
    }
  });
  return Survey;
};

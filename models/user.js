var bcrypt = require('bcrypt'); // bcrypt for password hashing

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    },
    failures: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    instanceMethods: {
      checkPassword: function(password, done) {
        bcrypt.compare(password, this.password, function(err, isMatch) {
          this.lastLogin = Date.now();
          if (!isMatch) {
            this.failures += 1;
          } else {
            this.failures = 0;
          }
          return done(null, isMatch);
        });
      }
    },
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Survey);
      }
    }
  });
  return User;
};

var bcrypt = require('bcrypt'); // bcrypt for password hashing
var SALT_WORK = 10; // Salt work factor

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
      allowNull: true
    },
    failures: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    instanceMethods: {
      checkPassword: function(password, done) {
        if (this.failures >= 5 && new Date(Date.now() + (1 * 60 * 60 * 1000)) < )
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
    hooks: {
      beforeValidate: function(user, options, cb) {
        if(user.changed('password')) {
          bcrypt.genSalt(SALT_WORK, function(err, salt) {
            if (!!err) {
              throw new Error('Error in generating salt.');
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
              if (!!err) {
                throw new Error('Error in generating password hash.');
              }
              user.password = hash;
              return cb(null, user);
            });
          });
        }
        return cb(null, user);
      }
    },
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Survey);
      }
    }
  });
  return User;
}

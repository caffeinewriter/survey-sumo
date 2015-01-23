var path = require('path');
var config = require(path.join(__dirname, '/config.js'));
var bcrypt = require('bcrypt');

var Helpers = {
  genHash: function(password) { 
    bcrypt.genSalt(config.app.salt.work, function(err, salt) {
      if (!!err) {
        throw new Error('Error in generating salt.');
      }
      bcrypt.hash(password, salt, function(err, hash) {
        if (!!err) {
          throw new Error('Error in generating password hash.');
        }
        console.log(hash);
        return hash;
      });
    });
  },
}

module.exports = Helpers;

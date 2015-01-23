var path = require('path');
var config = require(path.join(__dirname, '/config.js'));
var bcrypt = require('bcrypt');

var genHash = function(password) {
  bcrypt.genSalt(config.salt.work, function(err, salt) {
    if (!!err) {
      throw new Error('Error in generating salt.');
    }
    bcrypt.hash(this.password, salt, function(err, hash) {
      if (!!err) {
        throw new Error('Error in generating password hash.');
      }
      return hash;
    });
  });
}

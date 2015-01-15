var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config.js'));
var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  dialect: config.db.dialect
});
var db = {};


fs.readDirSync(__dirname).filter(function(file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {
  var model = sequelize["import"](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function(name) {
  if("associate" in db[name]) {
    db[name].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

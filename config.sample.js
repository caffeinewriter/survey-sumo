var config = {
  app: { // Application configuration settings
    port: 7866, // Application Port
    cookie: {
      secret: 'sumo wrestler' // Secret used to salt cookies. Should be random.
    },
    session: {
      secret: 'keyboard cat' // Secret used to salt sessions. Should be random.
    }
  },
  mongo: { //MongoDB information. Only required for using MongoDB as a persistent session store.
    enabled: false, // Leave this false if you don't want to use MongoDB Session Store
    host: 'localhost', //MongoDB host
    port: '41167', //MongoDB port
    user: 'sumo', //MongoDB Usera
    pass: 's3cretsum0', //MongoDB Password
    name: 'sumosurveys', //MongoDB Database Name
    store: {
      salt: 'change me' //MongoStore salt.
    }
  },
  db: { //SQL connection info for Sequelize
    dialect: 'mysql', // SQL Dialect. Must be an option accepted by Sequelize.js' "dialect" option, and not "sqlite". http://sequelize.readthedocs.org/en/latest/docs/getting-started/#setting-up-a-connection
    host: 'localhost', // SQL Database Host (Format: host.name:port)
    database: 'sqlsumo', // Database name
    username: 'sqlsumo', // Database username
    password: 's3cretsum0' // Database password
  }
}

module.exports = config;

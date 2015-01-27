Sumo Survey
===========

A feature-rich, secure survey application built with Sequelize.js, Express, MySQL, and (optionally) MongoDB.

##Features

* Allows for single-choice or multiple-choice questions.
* Randomly displays questions to users, not displaying the same question to the same user more than once.
* All post routes are protected against Cross-Site Request Forgery (CSRF) attacks via CSRF tokens.
* Responsive interface that looks wonderful on any device.
* Utilizes [c3.js](http://c3js.org/) to display results.
* Full-featured administration dashboard.
* Optional support for MongoDB session storage to persist sessions.
* Hashes all passwords using bcrypt for security.
* Supports all dialects [supported by Sequelize](http://sequelize.readthedocs.org/en/latest/docs/getting-started/#setting-up-a-connection) except for `sqlite`.

##Setup

1. Run `npm install` to install all necessary dependencies from `package.json`.
2. Set up `config.js` according to the schema specified in `config.sample.js`. Or see the documentation on [`config.js`](#configjs) below.
3. Use `npm start` to start the server. Specify `NODE_ENV` as an environment variable, and set it to `development` for testing, or `production` for a production environment.

##Configuration

Configuration is handled through [`config.js`](#configjs), although certain options may be superceded by environment variables for convenience.

###`config.js`

```javascript
var config = {
  app: { // Application configuration settings
    port: 7866, // Application Port
    cookie: {
      secret: 'sumo wrestler' // Secret used to salt cookies. Should be random.
    },
    session: {
      secret: 'keyboard cat' // Secret used to salt sessions. Should be random.
    },
    salt: {
      work: 11 // The salt work factor for bcyrpt
    }
  },
  mongo: { //MongoDB information. Only required for using MongoDB as a persistent session store.
    enabled: false, // Leave this false if you don't want to use MongoDB Session Store
    host: 'localhost', //MongoDB host
    port: '41167', //MongoDB port
    user: 'sumo', //MongoDB Username
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
```

##User-facing Routes

###`/`

A simple homepage. Renders `index.jade`.

###`/answer`

Displays a random survey question from the `Surveys` table. Renders `answer.jade` if there are questions to answer, and `done.jade` if the user has answered all current survey questions.

##Administration Routes

###`/admin`

A convenience route that will either render either `login.jade` or `dashboard.jade` depending on the user's authentication status.

###`/admin/setup`

The initial setup URL. It can only be accessed if no users exist in the database. Otherwise, it will redirect to the login page. It renders `setup.jade`.

###`/admin/dashboard`

A simple dashboard that allows access to all administration features. Renders `dashboard.jade`.

###`/admin/new/survey`

Provides an interface to create new surveys. Allows for creation of either single-choice, or multiple-choice surveys with unlimited answers. However, the `JSON.stringify`-parsed answers cannot exceed 8192 characters. (This can be changed by modifying `models/survey.js`) Renders `new-survey.jade`.

###`/admin/list/survey`

A list of all current surveys on the application with the survey ID, and the survey question, and links to delete them, or view the results. Renders `list-surveys.jade`.

###`/admin/results/:surveyId`

Renders the results of the survey where the ID Matches `surveyId` using `c3.js`. Renders `view-results.jade`.

###`/admin/delete/survey`

A `POST` only route for deletion of surveys.

###`/admin/new/user`

An interface to create new users with administration access. Renders `new-user.jade`.

###`/admin/list/user`

A list of all current users registered on the application. It also has links to edit and delete all users. However, the currently logged in user cannot be deleted. Renders `list-users.jade`.

###`/admin/edit/user/:userId`

Allows users to edit the username and password for the user with id `userId`.

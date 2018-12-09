'use strict';

const log = require('./logger');
const routes = require('./routes');

const port = process.env.PORT || 3000;

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');

const errorHandler = (error, req, res) => {
  log.error(`[${req.method}] ${req.url}: ${ JSON.stringify(req.body) } - ERROR: ${error}`);
  res.status(500);
  res.send(`error: ${error}`);
};

// middleware that is specific to this router
const logReq = (req, res, next) => {
  log.verbose(`[${req.method}] ${req.url}: ${ JSON.stringify(req.body) }`);
  next();
};

log.info(`Starting in ${process.env.NODE_ENV} mode`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({secret: 'Ricks secrect'}));

//Log all reqs
app.use(logReq);
app.use('/api', routes);
app.use(express.static('client'))
app.get('/*',
  function indexFile (req, res, next) {
    res.sendFile('index.html', { root: 'client' }, function (err) {
      if (err) {
        next(`error sending index.html: ${err}`);
      }
    });
  }
);
//Error handler
app.use(errorHandler);


app.listen(port, () => {
  log.info(`Listening on ${port}`);
});






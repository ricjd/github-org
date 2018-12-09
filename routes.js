'use strict';

const express = require('express');
const router = express.Router();
const controller= require('./controller');

router.get('/ping', (req, res, next) => {
  res.send('pong');
});

router.get('/stats/:org', controller.getOrgStats);

router.get('/auth', controller.authUser);

module.exports = router;
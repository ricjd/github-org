'use strict';

const octokit = require('@octokit/rest')();
const request = require('request');
const RateLimit = require('async-sema/rate-limit');

const querystring = require('querystring');

const log = require('./logger');

const appId = '8432eb96ad51b57e0e28';
const privateKey = '23fb45f47886c32934b438d9f2627576e254c457';

const getOrgStats = async (req, res, next) => {
  let repos;
  let repoContributorsStats = [];
  let recalc = false;
  if (!req.session.token) {
    res.status(401);
    return next('Please authenticate');
  }
  octokit.authenticate({
    type: 'oauth',
    token: req.session.token
  })
  const options = octokit.repos.listForOrg.endpoint.merge({org: req.params.org, per_page: 100});

  try {
    repos = await octokit.paginate(options);

    //wait a second between each request
    //https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits
    const contributionsRateLimit = RateLimit(5);
    let tempContributorsStats
    for (let i = 0; i < repos.length; i++) {
      await contributionsRateLimit();
      tempContributorsStats = await octokit.repos.getContributorsStats({owner: repos[i].owner.login, repo: repos[i].name});
      if (tempContributorsStats.status === 202) {
        recalc = true;
      }
      if (tempContributorsStats.data) {
        repos[i].contributors = tempContributorsStats.data.length;
      }
      else {
        repos[i].contributors = -1;
      }
      repoContributorsStats.push(tempContributorsStats);
      tempContributorsStats
    }

    //Show rate limits left
    const rates = await octokit.rateLimit.get({});
    log.info(`Rates after calls ${JSON.stringify(rates.data.resources)}`);
  }
  catch (error) {
    log.error(`Error getting data ${error}`);
    let errMsg = 'Unknown error';
    if (error.status === 404) {
      errMsg = 'Organisation does not exist';
    }
    else if (error.status === 403) {
      errMsg = 'Rate limit hit';
    }
    return next(errMsg);
  }

  repos.sort(function(a, b){return b.forks_count - a.forks_count});
  const topTenForks = repos.slice(0, 10).map(repo => repo.name);
  repos.sort(function(a, b){return b.stargazers_count - a.stargazers_count});
  const topTenStared = repos.slice(0, 10).map(repo => repo.name);
  repos.sort(function(a, b){return b.contributors - a.contributors});
  const topTenContributors = repos.slice(0, 10).map(repo => repo.name);

  // Top internal contributors: these should be the users who are public members of the organization ranked by their contributions to repositories belonging to the organization.
  // Top external contributions: same as internal contributors, except for users who are not public members of the organization.

  res.send({topTenForks, topTenStared, topTenContributors, recalc});
}

const authUser = async (req, res, next) => {
  console.log(req.query);
  request.post(`https://github.com/login/oauth/access_token?client_id=${appId}&client_secret=${privateKey}&code=${req.query.code}`, function (error, response, body) {
    const data = querystring.parse(body);
    if (data.error) {
      return next(data.error_description);
    }
    console.log(data.access_token);
    req.session.token = data.access_token;
    res.cookie('auth', true, {
      made_write_conn: 1295214458
    }).redirect('/');
  });
}

module.exports = {
  getOrgStats,
  authUser
}
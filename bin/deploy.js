#!/usr/bin/env node
'use strict';

let log = require('../src/logging'),
  args = require('yargs').argv,
  timer = require('../src/timer')(),
  getConfig = require('../src/getConfig'),
  getDomain = require('../src/getDomain'),
  getEnvironment = require('../src/getEnvironment'),
  getGit = require('../src/getGit'),
  getDist = require('../src/getDist'),
  setS3 = require('../src/setS3'),
  setFastly = require('../src/setFastly'),
  config;

  timer.start();

  getConfig()

    // Set Config
    .then(cfgs => config = cfgs)

    // Get Target Domain
    .then(opts => getDomain(config, args))

    // Set Environment
    .then(opts => getEnvironment(config, opts))

    // Set Git
    .then(opts => getGit(config, opts))

    // Build Dist
    .then(opts => getDist(config, opts))

    // Upload to S3
    .then(opts => setS3(config, opts))

    // // Set Fastly & Purge
    .then(opts => setFastly(config, opts))

    // Finish
    .then(opts => {
      // log.object({
      //   domain: ' '+opts.domain.url,
      //   environment: opts.environment.key,
      //   branch: ' '+opts.git_branch
      // }, 83);
      log.success(timer.stop());
    }, err => {
      log.error(err);
      log.failed(timer.stop());
      process.exit(1);
    })
    


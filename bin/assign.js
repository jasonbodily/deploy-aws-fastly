#!/usr/bin/env node
'use strict';

let log = require('../src/logging'),
  args = require('yargs').argv,
  timer = require('../src/timer')(),
  getConfig = require('../src/getConfig'),
  getDomain = require('../src/getDomain'),
  getEnvironment = require('../src/getEnvironment'),
  getVersion = require('../src/getVersion'),
  setFastly = require('../src/setFastly'),
  config;

  timer.start();

  // Get Compiled Frontend

  getConfig()

    // Set Config
    .then(cfgs => config = cfgs)

    // Get Target Domain
    .then(opts => getDomain(config, args))

    // Set Environment
    .then(opts => getEnvironment(config, opts))

    // Select Version
    .then(opts => getVersion(config, opts))

    // // Set Fastly & Purge
    .then(opts => setFastly(config, opts))

    // Finish
    .then(opts => {
      // log.object({
      //   domain: ' '+opts.domain.url,
      //   environment: opts.environment.node_env,
      //   branch: ' '+opts.git_branch
      // }, 83);
      log.success(timer.stop());
    }, err => {
      log.error(err);
      log.failed(timer.stop());
      // process.exitCode = 1;
    });


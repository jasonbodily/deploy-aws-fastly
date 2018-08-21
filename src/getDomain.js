'use strict';

let log = require('./logging'),
  timer = require('./timer')(),
  inquirer = require('inquirer');

function fill(str, len) {
  return str + Array(len).join(' ').slice(str.length);
}

function fillPre(str, len) {
  return Array(len).join(' ').slice(str.length) + str;
}

module.exports = (config, opts) => {

  let domains = config.domains,
      domain = domains.find(d => d.title.toLowerCase() === opts.domain);

  timer.start();
  log.header('Resolving Domain');

  // Select Environment
  return inquirer.prompt({
    when: () => !domain,
    type: 'list',
    name: 'domain',
    message: 'Select a domain:',
    choices: domains.map(d => ({
      name: `${fill(d.title, 10)}${fillPre(d.url, 24)}`,
      value: d
    }))
  })
  .then(res => {
    opts.domain  = res.domain || domain;
    log.run(opts.domain.url, 'Target Domain is ');
    log.finish('Finished', timer.stop());
  })
  .then(() => opts)

}

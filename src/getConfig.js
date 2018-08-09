'use strict';

const fs = require('fs'),
    path = require('path'),
    app_path = require('app-root-path').path,
    timer = require('./timer')(),
    log = require('./logging'),
    request = require('request');

module.exports = () => {

  timer.start();
  log.header('Building Deploy Configuration');

  return new Promise((resolve, reject) => {
    let file_path = path.join(app_path, '.deployconfig.json'),
        content_string,
        config;

    if (!fs.existsSync(file_path)) {
      reject(`Missing '.deployconfig.json' file in app root`);
    }

    try {
      content_string = fs.readFileSync(file_path);
      config = JSON.parse(content_string);
    } catch(error) {
      return reject(error); 
    }

    if (!config.remote) {
      return resolve(config);
    }
    request(config.remote, (error, response, body) => {
      let invalid = response && response.statusCode === 403;
      if (error || invalid) {
        reject(invalid ? `Invalid Deploy Credentials.` : error);
      }
      resolve(JSON.parse(body));
    });
  }).then(config => {
    config._app_root_path = app_path;
    config._app_dist_path = path.join(app_path, config.dist_path || 'dist');
    log.run('', 'Configuration set');
    log.finish('Finished', timer.stop());
    return config;
  });

}

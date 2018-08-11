'use strict';

let
  cp = require('child_process'),
  getGitBranchName = require('git-branch-name'),
  inquirer = require('inquirer'),
  timer = require('./timer')(),
  log = require('./logging');

module.exports = (config, opts) => {

  let { environment } = opts,
      { required_branch, require_clean } = environment.git;

  timer.start();
  log.header('Resolving Git Branch');
  return new Promise((resolve, reject) => {
    getGitBranchName(config._app_root_path, (err, branch) => {
      if (err) {
        return reject(err);
      }
      if (required_branch && required_branch !== branch) {
        return inquirer.prompt({
          type: 'confirm',
          name: 'override',
          message: `Environment '${environment.key}' requires branch '${required_branch}'. ` +
            `Override with '${branch}'?`
        }).then(resp => resp.override ? resolve(branch) : reject('Exit on Git Branch'));
      }
      resolve(branch);
    });
  })
  .then(branch => {
    // git status -uno
    log.run('', 'Verifying clean and up-to-date git branch');
    return Promise.all([
      new Promise((resolve, reject) => {
        if (!require_clean) {
          return resolve(branch);
        }
        cp.exec('git status -uno -u', { cwd: config._app_root_path }, (err, stdout, stderr) => {
          if (err) {
            return reject(err);
          }
          let up_to_date = stdout.match(/Your branch is (up-to-date|up to date)/i),
              clean = stdout.match(/nothing to commit, working (tree|directory) clean/i);
          if (clean && up_to_date) {
            resolve(branch);
          } else {
            reject(stdout);
          }
        });
      }),
      new Promise((resolve, reject) => {
        cp.exec('git rev-parse --short HEAD', { cwd: process.cwd() }, (err, stdout, stderr) => {
          if (err) {
            return reject(err);
          } else if (typeof stdout !== 'string') {
            return reject(new Error('Error in retrieving git HEAD'))
          }
          resolve(stdout.trim());
        })
      })
    ]);
  })
  .then(responses => {
    let branch = responses[0],
        head = responses[1];
    log.run(branch, 'Git Branch is');
    log.finish(`Finished`, timer.stop());
    opts.git_branch = branch;
    opts.git_head = head;
    return opts;
  });

}

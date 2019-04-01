'use strict';

let cp = require('child_process'),
	log = require('./logging'),
	timer = require('./timer')(),
  moment = require('moment');

module.exports = (config, opts) => {

	timer.start();
	log.header('Creating Distribution');

	// Resolve Repository
  let skip_install = /^\s*(true|1)\s*$/i.test(opts.skipNpmInstall)
      install = skip_install ? Promise.resolve() : execute('npm install')

	return install

		// Run Compile Task, return dist file
		.then(() => {
      let env = opts.environment,
          env_args = env.args || {},
          env_args_str = Object.keys(env_args).reduce((str, key) => {
            return str += `${key}='${env_args[key]}' `;
          }, '');
      return execute(`${env_args_str} npm run build ${env.cmd_postfix || ''}`);
    })

		// Get Version
		.then(() => {
			return new Promise((resolve, reject) => {
				log.finish(`Finished`, timer.stop());
				opts.version = moment().format('YYYY-MM-DD_HH-mm-ss') + '_' + opts.git_head;
				resolve(opts);
			});
		});

	function execute(cmd, opts) {
		let spinner = log.run(cmd);
		spinner.start();
		return new Promise((resolve, reject) => {
			cp.exec(cmd, opts || { cwd: config._app_root_path }, (err, stdout, stderr) => {
				spinner.stop(true);
				return err ? reject(stderr) : resolve();
		  });
		});
	}

}

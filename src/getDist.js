'use strict';

let cp = require('child_process'),
	log = require('./logging'),
	timer = require('./timer')(),
  moment = require('moment');

module.exports = (config, opts) => {

	timer.start();
	log.header('Creating Distribution');

	// Resolve Repository
	return execute('npm install')

		// Run Compile Task, return dist file
		.then(() => execute(`NODE_ENV=${opts.environment.node_env} npm run build`))

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

'use strict';

let log = require('./logging'),
	timer = require('./timer')(),
	inquirer = require('inquirer');

module.exports = (config, opts) => {

  if (!opts.domain || !opts.domain.environment_keys) {
    throw 'No environments found for provided domain';
  }

	let environments = opts.domain.environment_keys
      .map(key => config.environments[key])
      .filter(e => e),
		environment = environments.find(e => e.node_env === opts.env) || (environments.length === 1 && environments[0]);

	timer.start();
	log.header('Resolving Environment');

	// Select Environment
	return inquirer.prompt({
		when: () => !environment,
		type: 'list',
		name: 'environment',
		message: 'Select an environment:',
		choices: environments.map(env => ({
			name: env.node_env,
			value: env
		}))
	})
	.then(res => {
		opts.environment = res.environment || environment;
		log.run(opts.environment.node_env, 'Compile Environment is ');
		log.finish('Finished', timer.stop());
	})
	.then(() => opts)

}

let 
  log = require('./logging'),
	https = require('https'),
	request = require('request'),
	inquirer = require('inquirer'),
	timer = require('./timer')();

const isObject = obj => obj === Object(obj);

module.exports = (config, opts) => {

	let fastly = config.fastly,
		url = `https://${fastly.url}`,
		headers = {
			'Fastly-Key': fastly.api_key,
			'Content-Type': 'application/json'
		};

	timer.start();

	// Retrieve versions
	log.header('Configuring Cache (Fastly)');
	log.run('', 'Fetching Environments');
	return fastlyApi(`/service`)

  // Get Fastly Service
	.then(services => {
    let service = services.find(s => s.id === opts.domain.fastly_service_id);
    if (!service) {
      throw 'No Configured Fastly Service found!';
    }
    return service;
	}).then(service => opts.service = service)

	// Select Fastly Service Version
	.then(() => {
		let versions = opts.service.versions,
  			active = versions.find(v => v.number === opts.service.version);

		return active || inquirer.prompt([
			{
				type: 'list',
				name: 'version',
				message: 'Select a Fastly Version:',
				choices: versions
					.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))
					.map(version => ({
						name: `version ${version.number}`,
						value: version
					}))
			}
		])
		.then(res => res.version);

	}).then(version => opts.fastly_version_template = version)

	// // Clone selected version
	.then(() => {
		log.run('', 'Cloning Version Template');
		return fastlyApi(`/service/${opts.service.id}/version/${opts.fastly_version_template.number}/clone`, 'put')
			.then(version => opts.fastly_version = version)
			.then(() => {
				fastly.sid = opts.service.id;
				fastly.vid = opts.fastly_version.number;
			});
	})

	// // Get Version Header
	.then(() => {
		log.run('', 'Updating Content Header');
		return fastlyApi(`/service/${fastly.sid}/version/${fastly.vid}/header`)
			.then(headers => {
				opts.fastly_version_header = headers.find(h => h.name === fastly.version_header_name);
				if (!opts.fastly_version_header) {
					throw `No Content Header Found on Fastly Version with name '${fastly.version_header_name}'!`;
				}
			});
	})

	// // Update Clone's Header to version path
	.then(() => {
    let version_path = `${opts.environment.aws.prefix}/${opts.version}`;
		return fastlyApi(`/service/${fastly.sid}/version/${fastly.vid}/header/${fastly.version_header_name}`, 'put', {
			regex: `^/`,
			substitution: `/${version_path}/`
		}).then();
	})

	// // Activate
	.then(() => {
		log.run('', 'Activating Version');
		return fastlyApi(`/service/${fastly.sid}/version/${fastly.vid}/activate`, 'put');
	})

	// // Purge
	.then(() => {
		log.run('', 'Purging Cache');
		return fastlyApi(`/service/${fastly.sid}/purge_all`, 'post');
	})

	.then(() => {
		log.finish('Finished', timer.stop());
		return opts;
	});

	function fastlyApi(path, method, json) {
		return new Promise((resolve, reject) => {
			let action = method ? request[method] : request;
			action.apply(action, [{
				url: `${url}${path}`,
				headers: headers,
				json: json
			}, (err, res, body) => {
				if (!err && res.statusCode === 200) {
					return resolve(isObject(body) ? body : JSON.parse(body));
				}
				reject(err);
			}]);
		});
	}

};

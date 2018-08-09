'use strict';

let 
  AWS = require('aws-sdk'),
  log = require('./logging'),
  inquirer = require('inquirer'),
  timer = require('./timer')();

module.exports = (config, opts) => {

  const s3 = new AWS.S3(config.aws.options);

	log.header('Version Selection');
	timer.start();

	// List Directories of bucket
  let dirs = [],
    { bucket, prefix } = opts.environment.aws,
    Prefix = `${prefix}/`;

  return listKeys(s3, {
    Bucket: bucket,
    Delimiter: '/',
    Prefix,
  }).then(keys => {
    let versions = keys
      .map(k => k.replace(Prefix, '').split('/')[0])
      .sort()
      .reverse();
    if (!versions.length) {
      throw `No Distributions Found in bucket ${bucket}`
    }
		return inquirer.prompt([
			{
				type: 'list',
				name: 'version',
				message: 'Select a version:',
				choices: versions,
				default: versions[0]
			}
		]).then(res => {
			opts.version = res.version;
			log.finish('Finished', timer.stop());
		});
	})

	.then(() => opts);

}

function listKeys(s3, s3_params) {
  s3_params = Object.assign({}, s3_params);
  return (function listKeysRecursively (keys, token) {
    s3_params.ContinuationToken = token;
    return listKeyPage(s3, s3_params, keys)
      .then(next_token => next_token ? listKeysRecursively(keys, next_token) : keys)
  })([]);
}

function listKeyPage (s3, s3_params, keys) {
  return s3.listObjectsV2(s3_params).promise().then(response => {
    let new_keys = s3_params.Delimiter ? 
        response.CommonPrefixes.map(item => item.Prefix) : 
        response.Contents.map(item => item.Key);
    keys.push(...new_keys);
    return response.IsTruncated && response.NextContinuationToken;
  });
}

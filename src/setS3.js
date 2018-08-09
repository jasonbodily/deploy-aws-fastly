'use strict';

const
  fs = require('fs'),
  AWS = require('aws-sdk'),
  log = require('./logging'),
  inquirer = require('inquirer'),
  mimeTypes = require('mime-types'),
  timer = require('./timer')();

module.exports = (config, opts) => {

  const s3 = new AWS.S3(config.aws.options);

	log.header('Uploading Distribution');
	timer.start();

  let { bucket, prefix } = opts.environment.aws,
      Prefix = `${prefix}/${opts.version}`;

  log.run(opts.environment.aws.bucket, 'Uploading to S3 bucket: ');
  return uploadDir(config._app_dist_path, Prefix, s3, {
    Bucket: bucket,
    ACL: 'public-read',
    Prefix
  }).then(() => {
    log.finish('Finished', timer.stop());
    return opts;
  });

}

function clean(str) {
  return (str || '').replace(/^\/|\/+$/g, '');
}

function cleanS3Params(params) {
  let { Bucket, Prefix, Key } = params;
  if (Bucket) { params.Bucket = clean(Bucket); }
  if (Prefix) { params.Prefix = clean(Prefix); }
  if (Key) { params.Key = clean(Key); }
}

function upload(source_path, Key, s3, s3_params) {
  cleanS3Params(s3_params);
  let params = Object.assign({}, s3_params, {
    Key,
    Body: fs.readFileSync(source_path),
    ContentType: mimeTypes.lookup(source_path) || undefined 
  });
  return s3.upload(params).promise();
}

function uploadDir(source_dir, Prefix, s3, s3_params, opt = {}) {
  let prefix_s3 = clean(Prefix || ''),
      prefix_dir = source_dir + (prefix_s3 ? '' : '/');
  let file_uploads = listDir(source_dir).map(file => {
    if (opt.filters && opt.filters.indexOf(file.name) > -1) {
      return;
    }
    let Key = prefix_s3 + file.path.replace(prefix_dir , '');
    return upload(file.path, Key, s3, s3_params);
  });
  return Promise.all(file_uploads);
}

function listDir(dir, file_paths = []) {
  fs.readdirSync(dir).forEach(name => {
    let path = `${dir}/${name}`;
    fs.statSync(path).isDirectory() ? 
      listDir(path, file_paths) : 
      file_paths.push({ path, name });
  });
  return file_paths;
}
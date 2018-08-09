'use strict';

var clc = require('cli-color'),
	moment = require('moment'),
	Spinner = require('cli-spinner').Spinner;

function getTimeBlock() {
	return '[' +  clc.blackBright(moment().format('HH:mm:ss')) + ']'; 
}

function getSpinner() {
	var spinner = new Spinner('           %s');
	spinner.setSpinnerString(18);
	spinner.setSpinnerDelay(150);
	return spinner;
}

module.exports = {
	header: header => {
		let dot_length = Math.max(0, 50-header.length);
		console.log(getTimeBlock(), `${header}`, clc.blackBright(Array(dot_length).join('•')));
	},
	finish: (title, time) => {
		console.log(getTimeBlock(), clc.blue(`${title}`), clc.blackBright(`(${time})`));
		console.log(); //Empty New Line
	},
	success: time => {
		console.log(getTimeBlock(), clc.xterm(83)('SUCCESS'), clc.blackBright(`(${time})`));
		console.log(); //Empty New Line
	},
	failed: time => {
		console.log(getTimeBlock(), clc.red('FAILED'), clc.blackBright(`(${time})`));
		console.log(); //Empty New Line
	},
	info: info => {
		console.log(getTimeBlock(), clc.blue('INFO:'), clc.blackBright(`${info}`));
	},
	error: err => {
		console.log(getTimeBlock(), clc.red('ERROR:'), clc.blackBright(`${err}`));
	},
	run: (cmd, prefix = 'Running') => {
		let text = cmd ? `'${clc.cyan(cmd)}'`: '';
		console.log(getTimeBlock(), prefix, text);
		return getSpinner();
	},
	green: text => {
		console.log(clc.xterm(83)(text));
	},
	object: (obj, color) => {
		for (let key in obj) {
			console.log(clc.xterm(color)(`     ${key}: ${obj[key]}`));
		}
		console.log(); //Empty New Line
	} 
};
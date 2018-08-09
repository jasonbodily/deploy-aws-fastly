'use strict';

module.exports = () => {
	let start;
	return {
		start: () => start = new Date().getTime(),
		stop: () => '' + Math.round((new Date().getTime()-start)/100)/10 + 's'
	}
};
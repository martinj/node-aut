# aut

Simple logging library with filtering using environment variables

## Installation

This module is installed via npm:

	$ npm install aut

## Filtering

By default all output is shown.

Show all name & levels except log2 & warn

	LOGLEVELS=*,-warn LOGNAMES=*,-log2 node myapp

Show specific names & levels

	LOGLEVELS=error,warn LOGNAMES=log2 node myapp

## Colors

	Colors is enabled when stdout is a TTY.

## Examples

	var log = require('aut')();
	log('foo bar');
	log('foo bar', { a: 'b' });
	log.error(new Error('Shit'));
	log.debug('hmm %s thats cool', 'wow');
	log.warn('oh my');
	log.info('aha..');

	// 13 Nov 16:41:53 - foo bar
	// 13 Nov 16:41:53 - foo bar { a: 'b' }
	// 13 Nov 16:41:53 [error] - Error: Shit
	//     at Object.<anonymous> (/Users/martin/foo/test.js:4:11)
	//     at Module._compile (module.js:456:26)
	//     at Object.Module._extensions..js (module.js:474:10)
	//     at Module.load (module.js:356:32)
	//     at Function.Module._load (module.js:312:12)
	//     at Function.Module.runMain (module.js:497:10)
	//     at startup (node.js:119:16)
	//     at node.js:906:3
	// 13 Nov 16:41:53 [debug] - hmm wow thats cool
	// 13 Nov 16:41:53 [warn] - oh my
	// 13 Nov 16:41:53 [info] - aha..

	var log2 = require('aut')('log2');
	log2('foo bar');
	log2('foo bar', { a: 'b' });
	log2.error(new Error('Shit'));
	log2.debug('hmm %s thats cool', 'wow');
	log2.warn('oh my');
	log2.info('aha..');

	// 13 Nov 16:41:53 log2 - foo bar
	// 13 Nov 16:41:53 log2 - foo bar { a: 'b' }
	// 13 Nov 16:41:53 log2 [error] - Error: Shit
	//     at Object.<anonymous> (/Users/martin/foo/test.js:27:12)
	//     at Module._compile (module.js:456:26)
	//     at Object.Module._extensions..js (module.js:474:10)
	//     at Module.load (module.js:356:32)
	//     at Function.Module._load (module.js:312:12)
	//     at Function.Module.runMain (module.js:497:10)
	//     at startup (node.js:119:16)
	//     at node.js:906:3
	// 13 Nov 16:41:53 log2 [debug] - hmm wow thats cool
	// 13 Nov 16:41:53 log2 [warn] - oh my
	// 13 Nov 16:41:53 log2 [info] - aha..

	var log3 = require('aut')('custom', {
		date: function () { return 'My Custom Date'; },
		write: function (msg) { console.log(msg); },
		levels: ['mega', 'alpha'],
		format: function (data) {
			return Object.keys(data).map(function (k) {
				return k + ': ' + data[k];
			}).join(', ');
		}
	});

	log3('foo bar');
	log3('foo bar', { a: 'b' });
	log3.mega(new Error('Shit'));
	log3.alpha('hmm');

	// date: My Custom Date, prefix: custom, args: [object Arguments]
	// date: My Custom Date, prefix: custom, args: [object Arguments]
	// date: My Custom Date, prefix: custom, args: [object Arguments], level: mega
	// date: My Custom Date, prefix: custom, args: [object Arguments], level: alpha


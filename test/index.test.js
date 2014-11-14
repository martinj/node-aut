'use strict';
process.env.NODE_ENV = 'test';
require('should');

describe('aut', function () {
	it('should add custom levels', function () {
		var log = require('../')({
			levels: ['foo']
		});

		log.foo.should.be.a.Function;
	});

	it('should format output', function (done) {
		var log = require('../')('test', {
			date: function () { return 'Date'; },
			write: function (str) {
				str.should.equal('\u001b[90mDate\u001b[39m test - foobar');
				done();
			}
		});

		log('foo%s', 'bar');
	});

	it('should filter names', function () {
		var log = require('../')({
			nameFilter: '*,-log2'
		});

		log.enabled('foobar').should.be.true;
		log.enabled('log2').should.be.false;

		log = require('../')({
			nameFilter: 'log2,log1'
		});

		log.enabled('log2').should.be.true;
		log.enabled('log1').should.be.true;
		log.enabled('log3').should.be.false;
	});

	it('should filter levels', function () {
		var log = require('../')({
			levelFilter: '*,-warn'
		});
		log.enabled(undefined, 'debug').should.be.true;
		log.enabled(undefined, 'warn').should.be.false;

		log = require('../')({
			levelFilter: 'warn,debug'
		});

		log.enabled(undefined, 'warn').should.be.true;
		log.enabled(undefined, 'debug').should.be.true;
		log.enabled(undefined, 'error').should.be.false;
	});
});
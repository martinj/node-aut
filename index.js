'use strict';

const moment = require('moment');
const inspect = require('util').inspect;
const printf = require('util').format;
const colors = require('colors');

const emptyFn = function () {};
const useColor = Boolean(process.stdout.isTTY);

colors.setTheme({
	error: 'red',
	warn: 'yellow',
	info: 'cyan',
	debug: 'blue'
});

/**
 * Parse filter of names & values to determine if they should be enabled or skipped.
 * @param  {String} type name,level
 * @param  {String} keys
 * @param  {String} enable
 * @param  {Object} skip
 */
function parseFilter(type, keys, enable, skip) {
	if (!keys) {
		enable.all[type] = true;
		return;
	}
	enable.all[type] = false;

	const split = keys.split(/[\s,]+/);
	split.forEach((key) => {
		if (!key) {
			return;
		}

		key = key.trim();
		if (key[0] === '-') {
			skip[type][key.substring(1, key.length)] = true;
			return;
		}

		if (key === '*') {
			enable.all[type] = true;
			return;
		}

		enable[type][key] = true;
	});
}

/**
 * Set color on string if colors is enabled
 * @param  {String} color color name
 * @param  {String} val
 * @return {String}
 */
function colorize(color, val) {
	if (!useColor || !colors[color]) {
		return val;
	}

	return colors[color](val);
}

/**
 * Check if output is enabled for a name and level
 * @param  {String} name
 * @param  {String} level
 * @param  {Object} enable
 * @param  {Object} skip
 * @return {Boolean}
 */
function enabled(name, level, enable, skip) {
	if ((name && skip.name[name]) || (level && skip.level[level])) {
		return false;
	}

	if ((enable.all.name || enable.name[name]) &&
		(enable.all.level || enable.level[level])) {
		return true;
	}

	return false;
}

/**
 * Default date formatter
 * @return {String} current time
 */
function date() {
	return moment().format('DD MMM HH:mm:ss');
}

/**
 * Default writer, writes to console.log
 * @param  {String} msg
 */
function write(msg) {
	console.log(msg);
}

/**
 * Default formatter
 * @param  {Object} data
 * @return {String}
 */
function format(data) {
	const args = data.args.map((arg) => {
		if (arg instanceof Error) {
			return arg.stack;
		}

		if (arg instanceof Object) {
			return inspect(arg, { colors: useColor });
		}
		return arg;
	});

	const msg = printf.apply(printf, args);
	const fmt = ['%s'];
	const vals = [colorize('grey', data.date)];

	if (data.name) {
		fmt.push('%s');
		vals.push(data.name);
	}

	if (data.level) {
		fmt.push('[%s]');
		vals.push(colorize(data.level, data.level));
	}

	fmt.push('- %s');
	vals.push(msg);
	return printf.apply(printf, [fmt.join(' ')].concat(vals));
}

/**
 * Create log functions
 * @param  {String} [name]
 * @param  {Object} [opts]
 * @param  {Function} [opts.date] custom date formatter
 * @param  {Function} [opts.format] custom formatter
 * @param  {Function} [opts.write] custom write function
 * @param  {String} [opts.levelFilter] defaults to process.env.LOGLEVELS
 * @param  {String} [opts.nameFilter] defaults to process.env.LOGNAMES
 * @param  {Array} [opts.levels] add custom levels
 * @return {Function}
 */
function log(name, opts) {
	if (typeof (name) === 'object') {
		opts = name;
		name = undefined;
	} else {
		opts = opts || {};
	}

	const dateFn = opts.date || date;
	const formatFn = opts.format || format;
	const writeFn = opts.write || write;
	const levels = ['error', 'warn', 'info', 'debug'].concat(opts.levels || []);
	const enable = { all: {}, name: {}, level: {} };
	const skip = { name: {}, level: {} };

	parseFilter('name', opts.nameFilter || process.env.LOGNAMES, enable, skip);
	parseFilter('level', opts.levelFilter || process.env.LOGLEVELS, enable, skip);

	const logger = function (level) {
		if (!enabled(name, level, enable, skip)) {
			return emptyFn;
		}
		return (...args) => {
			writeFn(formatFn({
				date: dateFn(),
				name: name,
				args: args || [],
				level: level
			}));
		};
	};

	const fn = logger();

	levels.forEach((level) => {
		fn[level] = logger(level);
	});

	if (process.env.NODE_ENV === 'test') {
		fn.enabled = function (name, level) {
			return enabled(name, level, enable, skip);
		};
	}

	return fn;
}

module.exports = function (name, opts) {
	return log(name, opts);
};

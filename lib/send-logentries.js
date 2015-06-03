var sendLogentries = (function () {
	
	var sendLogentries;

	/**
	 * Module dependencies and variables.
	 */
	
	var logentries = require('node-logentries'),
		onHeaders = require('on-headers'),
		log = {},
		times = {};

	/**
	 * Functionality / Private properties
	 */
	
	/**
	 *
	 * Set the settings to the path.
	 *
	 */
	function setSettings(path) {
		try {
			settings = require(path || '../settings.json');
		} catch (ex) {
			console.log('json file with tokens was not possible to read:');
			console.error(ex);
			console.log('without that file, you do not send logs to anything');
		}
		return settings;
	}
	/**
	 * 
	 * Initialize module to send logs to a <name> specified.
	 * 
	 */
	function init(name, settings) {
		var settings = settings || {},
			app = typeof settings === 'string' ? settings : settings[name];
		
		if (!app) {
			//default token if the name do not match with the settings tokens.
			console.error('No such name: ', name, '. Assign default token.');
			app = settings['default'];
			//throw new Error('No such name: ' + name);
		}

		if (!app || !app.token) {
			return null;
		}

		log = logentries.logger({
			token: app.token
		});

		return log;
	}

	/**
	 * 
	 * Get an snapshot of time and returns the id.
	 * 
	 */
	function start() {
		var start = process.hrtime();
			id = start[0] + '-' + (Math.floor(Math.random() * 100));

		times[id] = start;

		return id;
	}

	/**
	 * 
	 * End the snapshot time for a concrete id and return the elapsed time.
	 * 
	 */
	function end(id) {
		var time = times[id];
		if (!time) {
			throw new Error('No such id: ' + id);
		}

		var duration = process.hrtime(time);

		delete times[id];

		return (duration[0] * 1e9 + duration[1]);
	}

	/**
	 * 
	 * End the snapshot time for a concrete id and return the elapsed time.
	 * 
	 */
	function responseTime(fn) {

		return function responseTime(req, res, next) {
			var startAt = process.hrtime();

			onHeaders(res, function onHeaders() {
				var diff = process.hrtime(startAt);
				var time = diff[0] * 1e3 + diff[1] * 1e-6;

				//fn(req, res, time)
				//console.log('time: ', time);
				//typeof fn !== 'function'? console.log('time: ', time) : fn(time);
				//console.log('PATH: ', req.route.path);

				var generalLog = {
					route: req.route.path,
					host: req.headers.host,
					statusCode: res.statusCode,
					TotalTime: time,
					unit: 'ms'
				};

				typeof fn !== 'function'? (log.info ? log.info( generalLog ) : logUnallocated()) : fn(time);

			});

			res.on('close', function() {
				var diff = process.hrtime(startAt);
				var time = diff[0] * 1e3 + diff[1] * 1e-6;

				var generalLog = {
					route: req.route.path,
					host: req.headers.host,
					statusCode: res.statusCode,
					closed: true,
					TotalTime: time,
					unit: 'ms'
				};
				
				//console.log("Petición terminada en " + Math.round((new Date().getTime()-res.inicio.getTime())/1000) +"s");
				typeof fn !== 'function'? (log.info ? log.info( generalLog ) : logUnallocated()) : fn(time);
			});

			next();
		}
	}

	function logUnallocated() {
		console.log('log do not have assigned a token or is not initiated correctly');
	}

	/**
	 * Execution / Initialization / Public properties.
	 */

	sendLogentries = {
		setSettings: setSettings,
		init: init,
		log: log,
		start: start,
		end: end,
		responseTime: responseTime
	};
	
	module.exports = sendLogentries;
	
	return sendLogentries;
}());

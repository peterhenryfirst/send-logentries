send-logentries
===============

Send logs to logentries with a name instead of token and expose a basic functions to use with your logs.

## Installation

```sh
 npm install send-logentries --save
```

## Usage

The basic use to add to your application:

```javascript
var sl = require('send-logentries'),
	log = sl.init('app-test', sl.setSettings('path/to/file.json');
```

The `log` variable should have the same as logentries module when you put the token.

When you run your application, you need to create a json file with an object with tuples of name/token:

```javascript
{
	"default":
	{
		"token": "<token_value>"
	},
	"name":
	{
		"token": "<token_value>"
	}
}
```

And set the path of that file to the `init` function.

If you like, you can use other basic functions to use in your code.

With express:

```javascript
var express = require('express');

var app = express();

app.use(responseTime());
```

`responseTime()` function should use before other routes or put in the position that you desire to measure. This function send logs automatically to logentries with the format:

```javascript
{
	route: req.route.path,
	host: req.headers.host,
	statusCode: res.statusCode,
	TotalTime: time,
	unit: 'ms'
}
```

If you need to treat or process other information, its possible to pass a callback function and receive the time elapsed for a concrete request:

```javascript
app.use(sl.responseTime(function (time) {
	console.log('TIME: ', time);
	console.log({ Time: time, unit: 'ms' });
	log.info( { Time: time, unit: 'ms' } );
}));
```

You can also measure time for your async functions:

```javascript
var idTimeStamp = sl.start();

setTimeout(function() {
	var elapsedNano = sl.end(idTimeStamp);
	var elapsedMilli = elapsedNano / 1000000; // divide by a million to get nano to milli

	console.log('Time(ms): ', elapsedMilli);
	log.info( { Time: elapsedMilli, unit: 'ms' } );
}, 5000);
```

## Tests

```sh
 npm test
```

## Contributing

  TODO

## Release History

* 0.0.1 Initial release
#!/usr/bin/node

var cp = require('child_process');
var fs = require('fs');
var async = require('async');

var log = fs.createWriteStream(
	'log.log',
	{
		flags: 'w+',
	}
);

log.on('open', function () {

	const ls = cp.spawn(
		'ls',
		[
			'-lR'
		],
		{
			cwd: '/home/native/rpmbuild'
		}
	);

	ls.on('close', function (code) {
		console.log('exit w/', code);
	});

	ls.stdout.on('data', function (data) {
		console.log(data.toString(), '\n--------------------------------------------------');
		log.write(data);
	})

	ls.stderr.on('data', function (data) {
		console.log(data.toString(), '\n--------------------------------------------------');
		log.write(data);
	})

});

#!/usr/bin/node

'use strict';

const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const events = require('events');
const http = require('http');
const fse = require('fs-extra');
const _ = require('lodash');
const async = require('async');
const file = require('file');

const spawn = require('../quokka-os/lib/spawn.js');

const request = http.request({
	//host: '192.168.1.50',
	host: '127.0.0.1',
	path: '/deploya',
	//since we are listening on a custom port, we need to specify it by hand
	port: '25080',
	//This is what changes the request to a POST request
	method: 'POST'
});

request.on('response', (response) => {
		var body = ''

		response.on('data', function (chunk) {
			body += chunk.toString();
		});

		response.on('end', function () {
			console.log('HTTP Response:');
			console.log('Code:', response.statusCode);
			console.log('Message:', response.statusMessage);
			console.log('Body:', body);
		});
	}
);

const tar = spawn(
	'tar',
	[
		'-v',
		'-c',
		'-f', '-',
		'.'
	],
	{
		cwd: '/home/native/src/QComponent4'
	},
	(err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log('ok');
	}
);

const xz = spawn(
	'xz',
	[
		'-v',
		'-z',
		'-0'
	],
	(err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	}
);

tar.stderr.on('data', (data) => console.error(data.toString()));
tar.stdout.on('data', (data) => xz.stdin.write(data));
tar.stdout.on('end', () => xz.stdin.end());

xz.stderr.on('data', (data) => console.error(data.toString()));
xz.stdout.on('data', (data) => request.write(data));
xz.stdout.on('end', () => request.end());

//request.end();

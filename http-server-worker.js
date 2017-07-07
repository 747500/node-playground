'use strict';

const http = require('http');
const os = require('os');
const fs = require('fs');
const fse = require('fs-extra');
const async = require('async');
const spawn = require('../quokka-os/lib/spawn.js');

const hostname = '0.0.0.0'; // listen on all ports
const port = 25080;

const USERNAME = 'quokka';
const TARGETDIR = 'QComponent4';
var USERHOME = '.';

process.on('message', (msg) => {
	console.log('From parent:', msg);
});

var server = http.createServer((req, res) => {

	console.log(req.method, req.url);

	fse.emptyDir(TARGETDIR, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		process.send({ deploy: 'start' });

		const xz = spawn(
			'xz',
			[ '--decompress', '--stdout' ],
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);

		const tar = spawn(
			'tar',
			[ '--extract' ],
			{
				cwd: TARGETDIR
			},
			(err) => {
				if (err) {
					console.error(err);
				}
			}
		);

		req.on('data', (data) => xz.stdin.write(data));
		req.on('end', () => xz.stdin.end());

		xz.stdout.on('data', (data) => tar.stdin.write(data));
		xz.stdout.on('end', () => tar.stdin.end());

		tar.stdout.on('data', (data) => console.log(data.toString()));
		tar.stdout.on('end', () => {

			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('I do not like me anymore :(\n');

			process.send({ deploy: 'end' });
		});

		xz.stderr.on('data', (data) => console.error(data.toString()));
		tar.stderr.on('data', (data) => console.error(data.toString()));

	});

});

async.waterfall([
	(cb) => {

		fs.readFile('/etc/passwd', (err, data) => {

			if (err) {
				cb(err);
				return;
			}

			data.toString().split('\n').map((l) => {
				var f = l.split(':');

				if (USERNAME === f[0]) {
					USERHOME = f[5];
				}
			});

			cb();
		});

	},
	(cb) => {

		server.listen(port, hostname, () => {

			const msg = 'Server running at http://' + hostname + ':' + port + '/'

			if ('function' === typeof process.send) {
				process.send(msg);
			}
			else {
				console.log(msg);
			}

			try {
				process.chdir(USERHOME);
				process.setgid('quokka');
				process.setuid('quokka');
			}
			catch (err) {
				console.error('Refused to drop privs');
				cb(err);
				return;
			}

			cb();
		});

	}
], (err) => {
	if (err) {
		console.error(err);
		process.ext(1);
	}
});

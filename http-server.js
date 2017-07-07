'use strict';

const cp = require('child_process');
const worker = cp.fork('./http-server-worker.js');

worker.on('message', (msg) => {
	console.log(msg);

	if ('object' === typeof msg) {
		let systemctl;

		switch (msg.deploy) {
		case 'start':
			child = cp.spawn('systemctl', [ 'isolate', 'multi-user.target' ]);
			break;
		case 'end':
			child = cp spawn('systemctl', [ 'isolate', 'graphical.target' ]);
			break;
		}

		if (systemctl) {
			systemctl.once('error', (err) => console.error('systemctl', err));
			systemctl.once('close', (code) => console.error('systemctl', code));
		}
	}
});

worker.send('Пыщщ!!\n');

worker.on('close', () => process.exit(1));

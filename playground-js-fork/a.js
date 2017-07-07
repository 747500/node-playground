
'use strict';


var cp = require('child_process');


var child = cp.fork('b.js');


var task = setInterval(function () {

	var m = {
		ts: new Date()
	};

//	console.log('parent:', m);

	child.send(m);

}, 500);

child.on('message', function (message) {
	console.log('from child:', JSON.stringify(message, null, 2));
});


setTimeout(function () {

	task.unref();

	process.exit(0);

}, 5 * 1000);



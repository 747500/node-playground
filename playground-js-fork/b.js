
'use strict';


process.on('disconnect', function () {

	console.log('child: parent died');

	process.exit(0);

});

process.on('message', function (message) {

	process.send({
		a: 'ack',
		data: message
	});
	console.log('from parent:', JSON.stringify(message, null, 2));

});

import server from './server';
const io = require('socket.io')(server);
// io.set('origins', '*:*');
// io.set('origins', '*:*');
io.on('connection', (socket) => {
	console.log('connected');
	socket.on('NEW_COMMENT', (data) => {
		console.log('new comment made');
		console.log(data);
		io.emit('NEW_COMMENT_RECEIVED', data);
	});
	socket.on('NEW_REPLY', (data) => {
		console.log('new comment made');
		console.log(data);
		io.emit('NEW_REPLY_RECEIVED', data);
	});
});

export default io;

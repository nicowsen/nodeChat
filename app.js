// Port auf dem der Server läuft
var port = 8888;

// nodejs dependencies
// express framework
var express = require('express');
var app = express();

// http server
var http = require('http');
var server = http.createServer(app);

// socket.io für echtzeit kommunikation
var io = require('socket.io').listen(server);

// HTML templating engine
var jade = require('jade');

// Array für belegte usernamen
var usernames = [''];

// Speicherort der Views & Einstellungen für Jade
app.set('views', __dirname + '/jade_views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });

// Dateien im /public/ Ordner als statisch behandeln
app.use(express.static(__dirname + '/public'));


// Liefere für root (/) die index.jade Seite aus
app.get('/', function(req, res){
  res.render('index.jade');
});

// Starte Server auf Port "port"
server.listen(port);
console.log('Server started and listening on port ' + port);


var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
	users += 1; // Add 1 to the count
	reloadUsers(); // Send the count to all the users

	socket.on('message', function (data) { // Broadcast the message to all
		if (usernameIsSet(socket)) {
			var message = {
											date : new Date().toISOString(),
											username : socket.nickname,
											text : data
										};

			socket.broadcast.emit('message', message);
			console.log('user ' + message.username + ' said \'' + message.text + '\'');
		}
	});

	socket.on('setUsername', function (data) { // Assign a name to the user
		if (usernames.indexOf(data) == -1) // Test if the name is already taken
		{
			usernames.push(data);
			socket.nickname = data;
			socket.emit('usernameStatus', 'ok');
			console.log('user ' + data + ' connected');
		}	else {
			socket.emit('usernameStatus', 'error'); // Send the error
		}
	});

	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		reloadUsers();
		if (usernameIsSet(socket))
		{
			console.log('disconnect...');
			var username;
			username = socket.nickname;
			var index = usernames.indexOf(username);
			username.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('userCount', {'userCount': users});
}
function usernameIsSet(socket) { // Test if the user has a name
	if (socket.nickname === null) {
		return false;
	}	else {
		return true;
	}
}

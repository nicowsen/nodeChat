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


// Counter für angemeldete Benutzer
var users = 0;

io.sockets.on('connection', function (socket) {
	users += 1;

	// Sende Anzahl der Benutzer an alle Benutzer
	reloadUsers();

	// Setzen des Benutzernamens
	socket.on('setUsername', function (data) {
		// Überprüfe ob Name frei ist
		if (usernames.indexOf(data) == -1) {
			usernames.push(data);
			socket.nickname = data;

			// Sende Status OK zurück zum Client
			socket.emit('usernameStatus', 'ok');
			console.log('user ' + data + ' connected');
		}	else {
			// Sende Fehler zurück zum Client
			socket.emit('usernameStatus', 'Username taken'); // Send the error
		}
	});

	// Bei neuer Nachricht...
	socket.on('message', function (data) {
		// Wenn Benutzer einen Benutzernamen hat
		if (usernameIsSet(socket)) {
			// Konstruiere ein message-Objekt
			var message = {
											date : new Date().toISOString(),
											username : socket.nickname,
											text : data
										};

			// Und sende es an alle Benutzer
			socket.broadcast.emit('message', message);
			console.log('user ' + message.username + ' said \'' + message.text + '\'');
		}
	});


	// Bei Trennung der Verbindung...
	socket.on('disconnect', function () { // Disconnection of the client
		// Reduziere die Anzahl der Benutzer um 1
		users -= 1;
		// Sende neue Anzahl an alle Benutzer
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

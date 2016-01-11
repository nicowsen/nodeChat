var messageContainer, sendBtnButton;
var username = "";

// Init
$(function() {
	messageContainer = $('#messageInput');
	sendBtnButton = $("#sendBtn");
	bindButton();

	window.setInterval(time, 1000*10);

	// username modal

	$("#usernameSubmit").click(function() {
		setUsername();
	});

	sendBtnButton.click(function() {
		sendMessage();
	});

	$('#messageInput').keypress(function (e) {
		if (e.which == 13) {
			sendMessage();
		}
	});
});

//Socket.io
var socket = io.connect();
socket.on('connect', function() {
	console.log('connected');
	alert("connected to socketio");
});

socket.on('userCount', function(msg) {
	$("#userCount").html(msg.userCount);
});

socket.on('message', function(data) {
	addMessage(data['message'], data['username'], new Date().toISOString(), false);
	console.log(data);
});

//Help functions
function sendMessage() {
	if (messageContainer.val() != "") {
		if (username == "")	{
			$('#modalUsername').modal('show');
		}
		else {
			socket.emit('message', messageContainer.val());
			addMessage(messageContainer.val(), "Me", new Date().toISOString(), true);
			messageContainer.val('');
			sendBtnButton.button('loading');
		}
	}
}

function addMessage(msg, username, date, self) {
	var chatMessage = '' +
	'<div class="input-group chatMessage">' +
		'<p class="form-control">' + msg + '</p>' +
		'<span class="input-group-addon info">' + username + '</span>'+
	'</div>';

	$('#chatMessages').append(chatMessage);
}

// function bindButton() {
// 	sendBtn.button('loading');
// 	messageContainer.on('input', function() {
// 		if (messageContainer.val() === "") sendBtnButton.button('loading');
// 		else sendBtnButton.button('reset');
// 	});
// }

function setUsername() {
	if ($("#usernameInput").val() !== "") {
		socket.emit('setUsername', $("#usernameInput").val());
		socket.on('usernameStatus', function(data){
			if(data == "ok")
			{
				$('#modalUsername').modal('hide');
				$("#alertUsername").hide();
				username = $("#usernameInput").val();
			}
			else
			{
				$("#alertUsername").slideDown();
			}
		});
	}
}
function time() {
	$("time").each(function(){
		$(this).text($.timeago($(this).attr('title')));
	});
}
function setHeight() {
	$(".slimScrollDiv").height('603');
	$(".slimScrollDiv").css('overflow', 'visible')
}

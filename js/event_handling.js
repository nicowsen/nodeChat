//event_handling.js
$('#chatInput').keypress(function (e) {
  if (e.which == 13) {
     $('#sendBtn').click();
    return false;    //<---- Add this line
  }
});

$('#sendBtn').click(function () {
  var msg = $('#chatInput').val();
  var usr = $('#usrName').val();

  if (msg && usr) {
    $('.container').append('<div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">' + usr + '</h3></div><div class="panel-body"> ' + msg + '</div></div>');
    $('#chatInput').val("");
  }
});


$('#clearBtn').click(function () {
  $('.container').empty();
});
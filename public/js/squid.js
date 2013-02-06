var socket = io.connect('https://'+ window.location.host);
var logging = true;
$(document).ready(function() {
  $('#message-box').hide();

  socket.on('shellcode', function(data) {
     messagebox('<strong>Shellcode Deployed!</strong><br>Target ID: ' + data.id);
  });
  socket.on('request', function(data) {
    if (logging) {
      var time = new Date();
      $('#log').prepend("Time: " + time.toLocaleString() + " Remote IP: " + data.ip + " URL: https://" + data.url + "\n");
    }
  });

});

function toggleLogging() {
  logging = logging ? false: true;
  if (logging) $('#log-header button').text('Disable Logging');
  else $('#log-header button').text('Enable Logging');
}

function messagebox(m) {
  var box = $('#message-box');
  box.html(m);
  box.show();
  box.click(function() {
    box.fadeOut(500, function() {});
  });
}
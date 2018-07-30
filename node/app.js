
var inverter = require("./inverter.js");

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding( 'utf8' );

var uiControl = false;
var id = null;
var pos = 0;
var interval;
var toggle = false;

// on any data into stdin
stdin.on('data', function(key) {

  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }

  var data = null

  if (key === 'q')
  {
    uiControl = false;
    inverter.startup();
  }
  else if (key === 'p') // Start UI control
  {
    uiControl = true;
  }
  else if (key === 'a')
  {
    inverter.set_position(id, 0);
  }
  else if (key === 'b')
  {
    inverter.set_position(id, 0.25);
  }
  else if (key === 'c')
  {
    if (interval) {
      clearInterval(interval);
    } else {
      interval = setInterval(function () {
        if (toggle) {
          inverter.set_position(id, 0.3);
        } else {
          inverter.set_position(id, -0.3);
        }
        toggle = !toggle;
      }, 5000);
    }
  }
  else if (key === '0')
  {
    id = 0;
  }
  else if (key === '1')
  {
    id = 1;
  }
  else if (key === '2')
  {
    id = 2;
  }
  else if (key === '3')
  {
    id = 3;
  }
  else if (key === '4')
  {
    id = null;
  }
  else if (key === 'r') {
    inverter.start_reference_run(id);
  }
  else if (key === 't') {
    inverter.finish_reference_run(id);
  }
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var knobAngle = 0;

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("knob", function (degrees) {
    if (uiControl) {
      console.log("knob:", degrees);
      knobAngle = degrees;
    }
  });

});

http.listen(8080, function () {
  console.log('listening on port 8080');
});

setInterval(function () {
  if (uiControl) {
    inverter.set_position(id, knobAngle / 360.0);
  }
}, 100);

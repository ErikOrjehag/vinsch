
var inverter = require("./inverter.js");
var three = require("./three-d.js");

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
    inverter.set_revolutions(id, 0);
  }
  else if (key === 'b')
  {
    inverter.set_revolutions(id, 2.0);
  }
  else if (key === 'c')
  {
    if (interval) {
      clearInterval(interval);
    } else {
      interval = setInterval(function () {
        if (toggle) {
          inverter.set_revolutions(id, 0.3);
        } else {
          inverter.set_revolutions(id, -0.3);
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
  else if (key === 'r')
  {
    inverter.start_reference_run(id);
  }
  else if (key === 't')
  {
    inverter.finish_reference_run(id);
  }
  else if (key === 'y')
  {
    inverter.set_length(id, 2.0);
  }
  else if (key === 'h')
  {
    three.go_to({
      x: 0,
      y: 0,
      z: 2.0
    });
  }
  else if (key === 'j')
  {
    three.go_to({
      x: -1.2,
      y: 1.3,
      z: 2.0
    });
  }
  else if (key === 'k')
  {
    three.go_to({
      x: -1.2,
      y: 1.3,
      z: 0.6
    });
  }
  else if (key === 'l')
  {
    three.go_to({
      x: -1.2,
      y: 1.3,
      z: 0.3
    });
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

  socket.on("start-reference-run", function (id) {
    inverter.start_reference_run(id);
  });

  socket.on("finish-reference-run", function (id) {
    inverter.finish_reference_run(id);
  });

  socket.on("extend-specific", function (id) {
    inverter.extend_specific(id);
  });

  socket.on("home-specific", function (id) {
    three.home_specific(id);
  });

  socket.on("move-delta", function (delta) {
    tree.move_delta(delta);
  });

});

http.listen(8080, function () {
  console.log('listening on port 8080');
});

setInterval(function () {
  if (uiControl) {
    v = knobAngle / 360.0;
    three.go_to({
      x: v,
      y: v,
      z: 1.1
    });

    //inverter.set_revolutions(id, knobAngle / 360.0);
  }
}, 200);

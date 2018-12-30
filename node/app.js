
var inverter = require('./inverter');
var geom = require('./geom');
var move = require('./move');

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

var interval;

// on any data into stdin
stdin.on('data', function (key) {

  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }
  else if (key === 'q')
  {
    inverter.startup();
  }
  else if (key === 'p')
  {
    move.play();
  }
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("start-reference-run", function (id) {
    inverter.start_reference_run(id);
  });

  socket.on("finish-reference-run", function (id) {
    inverter.finish_reference_run(id);
  });

  socket.on("zero-specific", function (id) {
    inverter.set_length(id, 0);
  });

  socket.on("extend-specific", function (data) {
    inverter.extend_specific(data.id, data.delta);
  });

  socket.on("home-specific", function (id) {
    geom.home_specific(id);
  });

  socket.on("home", function () {
    geom.home();
  });

  socket.on("stop", function () {
    inverter.startup();
  });

  socket.on("move", function (delta) {
    move.set_vel(delta);
  });
});

http.listen(8080, function () {
  console.log('listening on port 8080');
});

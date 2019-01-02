
var inverter = require('./inverter');
var geom = require('./geom');
var move = require('./move');
var db = require('./db');

module.exports = function (io) {

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

    socket.on("create-show", function (name) {
      console.log(name);
      db.create_show(name);
    });

    db.on_shows_changes(function (shows) {
      console.log("CALLBACK", shows);
    });
  });

};


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

    socket.on("start-reference-run", function (data) {
      inverter.start_reference_run(data.id, data.speed);
    });

    socket.on("finish-reference-run", function (id) {
      inverter.finish_reference_run(id);
    });

    socket.on("zero-specific", function (id) {
      inverter.zero(id);
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
      db.create_show(name, function (err, shows) {
        if (err) console.error(err);
        else io.emit("shows", shows);
      });
    });

    socket.on("delete-show", function (id) {
      db.delete_show(id, function (err, shows) {
        if (err) console.error(err);
        else io.emit("shows", shows);
      });
    });

    socket.on("get-shows", function () {
      db.get_shows(function (err, shows) {
        if (err) console.error(err);
        else socket.emit("shows", shows);
      });
    });
  });

};

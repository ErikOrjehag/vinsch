
var inverter = require('./inverter');
var geom = require('./geom');
var move = require('./move');
var db = require('./db');

var io_;

module.exports.interface = function (io) {

  io_ = io;

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

    socket.on("make-default-show", function (id) {
      db.make_default_show(id, function (err, shows) {
        if (err) console.error(err);
        else io.emit("shows", shows);
      });
    });

    socket.on("copy-show", function (data) {
      db.copy_show(data.id, data.name, function (err, shows) {
        if (err) console.error(err);
        else io.emit("shows", shows);
      });
    });

    socket.on("rename-show", function (data) {
      db.rename_show(data.id, data.name, function (err, shows) {
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

    socket.on("edit-show", function (id) {
      db.get_show(id, function (err, show) {
        if (err) console.error(err);
        else socket.emit("show-"+show.id, show);
      });

      io.emit("position", geom.get_setpoint());
    });

    socket.on("set-show", function (show) {
      db.set_show(show, function (err, show) {
        if (err) console.error(err);
        else socket.emit("show-"+show.id, show);
      });
    });

    socket.on("goto", function (point) {
      geom.go_to(point, 0.25);
    });
  });

};

module.exports.send_position = function (position) {
  io_.emit("position", position);
};


var inverter = require('./inverter');
var geom = require('./geom');
var move = require('./move');
var play = require('./play');
var db = require('./db');

var io_;

exports.interface = function (io) {

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

    socket.on("home-specific", function (id) {
      geom.home_specific(id);
    });

    socket.on("home", function () {
      geom.home();
    });

    socket.on("stop", function () {
      geom.stop();
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
        else socket.emit("show-"+show._id, show);
      });

      exports.send_position(geom.get_setpoint());
      exports.send_playing(id, play.get_playing());
      exports.send_current(id, play.get_current());
    });

    socket.on("set-show", function (show) {
      db.set_show(show, function (err, show) {
        if (err) console.error(err);
        else io.emit("show-"+show._id, show);
      });
    });

    socket.on("goto", function (point) {
      geom.linear_to(point, 0.2);
    });

    socket.on("play-show", function (setup) {
      play.play(setup);
    });

    socket.on("stop-show", function () {
      play.stop();
    });
  });

};

exports.send_position = function (position) {
  io_.emit("position", position);
};

exports.send_current = function (id, index) {
  io_.emit("current-"+id, index);
};

exports.send_playing = function (id, playing) {
  io_.emit("playing-"+id, playing);
};

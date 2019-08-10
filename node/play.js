var geom = require('./geom');
var socket = require('./socket');
var db = require('./db');
var utils = require('./utils');

var playing = false;
var current = -1;

function time() {
  return Date.now() / 1000.0;
}

exports.get_playing = function () {
  return playing;
}

exports.get_current = function () {
  return current;
}

exports.stop = function () {
  if (playing) {
    playing = false;
  } else {
    geom.stop();
  }
}

exports.play = async function (setup) {

  console.log(setup)

  // Sanity check
  if (playing) return;
  if (setup.shows.length == 0) return;
  for (var i = 0; i < setup.shows.length; i++) {
    if (setup.shows[i].keyframes.length < 2) {
      return
    }
  }

  await geom.init();

  var current_show = 0;

  var ts = time();
  current = setup.start + 1;
  var prev = setup.shows[current_show].keyframes[current - 1];
  var target = setup.shows[current_show].keyframes[current];

  playing = true;

  socket.send_playing(setup.shows[current_show]._id, true);
  socket.send_current(setup.shows[current_show]._id, current);

  while (playing) {
    var elapsed = time() - ts;
    var progress = elapsed / target.time;
    var carrot = {
      x: prev.pos.x + (target.pos.x - prev.pos.x) * progress,
      y: prev.pos.y + (target.pos.y - prev.pos.y) * progress,
      z: prev.pos.z + (target.pos.z - prev.pos.z) * progress
    }
    await geom.go_to(carrot);

    var overshoot = elapsed - target.time;
    if (overshoot > 0) {
      current++;
      if (current == setup.shows[current_show].keyframes.length) {
        // Next show
        current_show++;
        if (current_show == setup.shows.length) {
          current_show--;
          break;
        } else {
          socket.send_playing(setup.shows[current_show-1]._id, false);
          socket.send_playing(setup.shows[current_show]._id, true);
          var prevKeyframes = setup.shows[current_show-1].keyframes;
          prev = prevKeyframes[prevKeyframes.length - 1];
          current = 0;
          target = setup.shows[current_show].keyframes[current];
        }
      } else {
        prev = setup.shows[current_show].keyframes[current - 1];
        target = setup.shows[current_show].keyframes[current];
      }
      ts = time() - overshoot;
      socket.send_current(setup.shows[current_show]._id, current);
    }
  }

  await utils.wait(2000);

  playing = false;
  current = -1;

  socket.send_playing(setup.shows[current_show]._id, playing);
  socket.send_current(setup.shows[current_show]._id, current);

  await geom.stop();
};

exports.play_default = function () {
  db.get_default_show(function (err, show) {
    if (err) console.log(err);
    else exports.play({
      start: 0,
      show: show
    });
  });
};

exports.goto_first_keyframe = function () {
  db.get_default_show(function (err, show) {
    if (err) console.log(err);
    else geom.linear_to(show.keyframes[0].pos);
  });
};

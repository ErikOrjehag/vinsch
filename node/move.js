
var geom = require('./geom');
var socket = require('./socket');

var vel = { x: 0, y: 0, z: 0 };
var timeout = undefined;
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
  playing = false;
}

exports.play = async function (setup) {
  var keyframes = setup.show.keyframes;
  if (keyframes.length < 2) return;
  var ts = time();
  current = setup.start + 1;
  var prev = keyframes[current - 1];
  var target = keyframes[current];

  playing = true;

  socket.send_playing(setup.show._id, playing);
  socket.send_current(setup.show._id, current);

  while (playing) {
    var elapsed = time() - ts;
    var progress = elapsed / target.time;
    var setpoint = {
      x: prev.pos.x + (target.pos.x - prev.pos.x) * progress,
      y: prev.pos.y + (target.pos.y - prev.pos.y) * progress,
      z: prev.pos.z + (target.pos.z - prev.pos.z) * progress
    }
    await geom.go_to(setpoint);

    var overshoot = elapsed - target.time;
    if (overshoot > 0) {
      current++;
      if (current == keyframes.length) {
        break;
      }
      console.log("NEW SETPOINT");
      ts = time() - overshoot;
      prev = keyframes[current - 1];
      target = keyframes[current];
      socket.send_current(setup.show._id, current);
    }
  }

  playing = false;
  current = -1;

  socket.send_playing(setup.show._id, playing);
  socket.send_current(setup.show._id, current);
};

exports.set_vel = function (delta) {
  vel = delta;
  if (!timeout) timeout = setTimeout(move, 1);
};

async function move () {
  await geom.increment_setpoint(vel);

  if (vel.x == 0 && vel.y == 0 && vel.z == 0) {
    timeout = undefined;
  } else {
    timeout = setTimeout(move, 1);
  }
};

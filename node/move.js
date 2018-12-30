
var geom = require('./geom');

var vel = { x: 0, y: 0, z: 0 };
var timeout = undefined;

var keyframes = [
  { pos: { x: 0, y: 0, z: 0.5 }, time: 5 }
  ,{ pos: { x: 0, y: 0, z: 0.88 }, time: 2 }
  ,{ pos: { x: 0, y: 0, z: 0.88 }, time: 4 }
  ,{ pos: { x: 0, y: 0, z: 1.5 }, time: 5 }
  ,{ pos: { x: 0, y: 1.0, z: 1.5 }, time: 4 }
  ,{ pos: { x: -1.0, y: -2.0, z: 1.0 }, time: 13 }
  ,{ pos: { x: 1.0, y: -2.0, z: 1.6 }, time: 10 }
  ,{ pos: { x: 0, y: 0, z: 1.5 }, time: 10 }
  ,{ pos: { x: 0, y: 0, z: 0.5 }, time: 5 }
];

function time() {
  return Date.now() / 1000.0;
}

exports.play = async function () {
  if (keyframes.length < 2) return;
  var ts = time();
  var index = 1;
  var prev = keyframes[index-1];
  var target = keyframes[index];

  while (true) {
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
      index++;
      if (index == keyframes.length) {
        break;
      }
      console.log("NEW SETPOINT");
      ts = time() - overshoot;
      prev = keyframes[index-1];
      target = keyframes[index];
    }
  }
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

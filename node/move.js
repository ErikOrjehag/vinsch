
var geom = require('./geom');

var firstTime = true;
var vel = { x: 0, y: 0, z: 0 };
var moveTimeout = undefined;
var stopTimeout = undefined;

exports.set_vel = async function (delta) {
  vel = delta;
  if (!moveTimeout) {
    if (firstTime) {
      console.log("first time move!");
      firstTime = false;
      await geom.init();
    }
    if (stopTimeout) stopTimeout = clearTimeout(stopTimeout);
    moveTimeout = setTimeout(move, 1);
  }
};

async function move () {
  await geom.increment_setpoint(vel);

  if (vel.x == 0 && vel.y == 0 && vel.z == 0) {
    moveTimeout = undefined;
    stopTimeout = setTimeout(() => geom.stop(), 2000);
  } else {
    moveTimeout = setTimeout(move, 1);
  }
};

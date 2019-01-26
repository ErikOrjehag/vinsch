var rpio = require('rpio');
//var move = require('./move');
//var geom = require('./geom');

rpio.init({ mapping: 'gpio' });

l1 = 6;
l2 = 13;
b4 = 11;
b3 = 10;
b2 = 17;
b1 = 4;

rpio.open(l1, rpio.OUTPUT, rpio.LOW);
rpio.open(l2, rpio.OUTPUT, rpio.LOW);
rpio.open(b1, rpio.INPUT, rpio.PULL_UP);
rpio.open(b2, rpio.INPUT, rpio.PULL_UP);
rpio.open(b3, rpio.INPUT, rpio.PULL_UP);
rpio.open(b4, rpio.INPUT, rpio.PULL_UP);

exports.set_leds = function (state) {
  switch (state) {
    case "playing":
      rpio.write(l1, rpio.HIGH);
      rpio.write(l2, rpio.LOW);
      break;
    case "ready":
      rpio.write(l1, rpio.HIGH);
      rpio.write(l2, rpio.HIGH);
      break;
    case "idle":
      rpio.write(l1, rpio.LOW);
      rpio.write(l2, rpio.HIGH);
      break;
  }
};

function pollcb(pin) {
  // Debounce
  rpio.msleep(20);
  if (rpio.read(pin)) return;

  console.log("pin", pin);

  switch (pin) {
    case b1:
      exports.set_leds("playing");
      //move.play_default();
      break;
    case b2:
      exports.set_leds("ready");
      //move.goto_first_keyframe();
      break;
    case b3:
      exports.set_leds("idle");
      //move.stop();
      break;
    case b4:
      exports.set_leds("idle");
      //geom.stop();
      break;
  }
}

exports.set_leds("idle");

rpio.poll(b1, pollcb, rpio.POLL_DOWN);
rpio.poll(b2, pollcb, rpio.POLL_DOWN);
rpio.poll(b3, pollcb, rpio.POLL_DOWN);
rpio.poll(b4, pollcb, rpio.POLL_DOWN);

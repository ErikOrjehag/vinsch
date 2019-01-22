var rpio = require('rpio');
var move = require('./move');

rpio.init({ mapping: 'gpio' });

l1 = 6;
l2 = 13;
b1 = 11;
b2 = 10;
b3 = 17;
b4 = 4;

rpio.open(l1, rpio.OUTPUT, rpio.LOW);
rpio.open(l2, rpio.OUTPUT, rpio.LOW);
rpio.open(b1, rpio.INPUT);
rpio.open(b2, rpio.INPUT);
rpio.open(b3, rpio.INPUT);
rpio.open(b4, rpio.INPUT);

exports.set_leds = function () {
  switch (state) {
    case "playing":
      rpio.write(l1, rpio.HIGH);
      rpio.write(l1, rpio.HIGH);
      break;
    case "ready":
      rpio.write(l1, rpio.LOW);
      rpio.write(l1, rpio.HIGH);
      break;
    case "idle":
      rpio.write(l1, rpio.HIGH);
      rpio.write(l1, rpio.LOW);
      break;
  }
};

function pollcb(pin) {
  // Debounce
  rpio.msleep(20);
  if (rpio.read(pin)) return;

  switch (pin) {
    case b1:
      exports.set_leds("playing");
      move.play_default();
      break;
    case b2:
      exports.set_leds("ready");
      move.goto_first_keyframe();
      break;
    case b3:
      exports.set_leds("idle");
      move.stop();
      break;
  }
}

exports.set_leds("idle");
rpio.poll(b1, pollcb, rpio.POLL_DOWN);

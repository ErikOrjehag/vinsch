/*

  /boot/config.txt
  gpio=4,10,11,17=pu

*/

var Gpio = require('onoff').Gpio;
var move = require('./move');
var play = require('./play');

var l1 = new Gpio( 6, 'out');
var l2 = new Gpio(13, 'out');
var b1 = new Gpio( 4, 'in', 'rising', { debounceTime: 10 });
var b2 = new Gpio(17, 'in', 'rising', { debounceTime: 10 });
var b3 = new Gpio(10, 'in', 'rising', { debounceTime: 10 });
var b4 = new Gpio(11, 'in', 'rising', { debounceTime: 10 });

exports.set_leds = function (state) {
  switch (state) {
    case "playing":
      l1.writeSync(1);
      l2.writeSync(1);
      break;
    case "ready":
      l1.writeSync(1);
      l2.writeSync(0);
      break;
    case "idle":
      l1.writeSync(0);
      l2.writeSync(1);
      break;
  }
};

exports.set_leds("idle");

b1.watch((err, value) => {
  exports.set_leds("playing");
  play.play_default();
});

b2.watch((err, value) => {
  exports.set_leds("ready");
  play.goto_first_keyframe();
});

b3.watch((err, value) => {
  exports.set_leds("idle");
  move.stop();
});

b4.watch((err, value) => {
  // Nothing
});

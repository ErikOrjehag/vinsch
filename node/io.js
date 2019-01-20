var rpio = require('rpio');

rpio.init({ mapping: 'gpio' });

l1 = 6;
l2 = 13;
b1 = 11;
b2 = 10;
b3 = 17;
b4 = 4;


/*
 * Set the initial state to low.  The state is set prior to the pin
 * being actived, so is safe for devices which require a stable setup.
 */
rpio.open(l1, rpio.OUTPUT, rpio.LOW);
rpio.open(l2, rpio.OUTPUT, rpio.LOW);
rpio.open(b1, rpio.INPUT);

function pollcb(pin) {
  rpio.msleep(20);
  if (rpio.read(pin)) return;
  console.log("press!");
  rpio.write(l1, rpio.HIGH);
  rpio.sleep(1);
  rpio.write(l1, rpio.LOW);
}

rpio.poll(b1, pollcb, rpio.POLL_DOWN);

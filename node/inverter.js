
var SerialPort = require("serialport");
var utils = require("./utils.js");
var db = require("./db.js");

var baudRate = 38400;
var deviceInverter = "/dev/tty.usbserial-FT1MJ3Q6";
if (process.argv.length > 2) {
  deviceInverter = process.argv[2];
}

// SPECIAL CASE: Pulley 0 has different radius than others
var WHEEL_RADIUS = [0.273, 0.25, 0.25, 0.25]

var portInverter = new SerialPort(deviceInverter, {
  autoOpen: true,
  baudRate: baudRate,
  dataBits: 8,
  stopBits: 1,
  parity: 'even'
});

portInverter.on('error', function(err) {
  console.log('Error inverter port: ', err.message);
});

// Read data that is available but keep the stream from entering "flowing mode"
var readbuf = new Buffer([]);
portInverter.on('readable', function () {
  readbuf = Buffer.concat([readbuf, portInverter.read()]);
  if (readbuf.length == 20) {
    //console.log('Response:', readbuf);
    readbuf = new Buffer([]);
  }
});

async function sendTelegram(id, PPO) {

  var STX = 0x2; // Start byte
  var LEN = PPO.length + 2; // Lenght of (ADDR + PPO.. + BCC)

  var echo = 0; // Should slave respond with echo?
  var broadcast = 0; // Broadcast to all slaves?
  var address = id;
  if (id == null) {
    broadcast = 1;
    address = 0;
  }

  var ADDR = (echo << 6) | (broadcast << 5) | address;

  // The telegram message
  var msg = [STX, LEN, ADDR].concat(PPO);

  // XOR check-sum
  var BCC = msg.slice(1).reduce((acc, val) => acc ^ val, msg[0]);

  msg.push(BCC);

  var buff = new Buffer(msg)
  //console.log("sendTelegram", id, buff);
  portInverter.write(buff);

  await utils.wait(22);
}

function word_from(bits) {
  return bits.reduce((acc, position) => acc | (1 << position), 0);
}

function create_PKW(PKE, IND, PWE) {
  return [
    PKE >> 8 & 0xff,
    PKE & 0xff,
    IND >> 8 & 0xff,
    IND & 0xff,
    PWE >> 24 & 0xff,
    PWE >> 16 & 0xff,
    PWE >> 8 & 0xff,
    PWE & 0xff,
  ]
}

function create_PZD(STW, SW1, SW2, SW3) {
  return [
    STW >> 8 & 0xff,
    STW & 0xff,
    SW1 >> 8 & 0xff,
    SW1 & 0xff,
    SW2 >> 8 & 0xff,
    SW2 & 0xff,
    SW3 >> 8 & 0xff,
    SW3 & 0xff
  ]
}

function create_PPO2(PKW, PZD) {
  return PKW.concat(PZD);
}

function to_speed(decimal) {
  return 0x4000 * decimal;
}

exports.startup = async function () {
  // Go from "Switch-on disabled" -> "Ready for switch-on"
  var STW = word_from([1, 2, 10]);
  var PZD = create_PZD(STW, 0, 0, 0);
  var PKW = create_PKW(0, 0, 0);
  var PPO = create_PPO2(PKW, PZD);
  await sendTelegram(null, PPO);
};

// Do startup when system is turned on
exports.startup();

exports.set_revolutions = async function (id, revolutions, speed) {
  // SPECIAL CASE: motor 0 is different direction from others...
  var increments = Math.round(revolutions * 1000) * (id == 0 ? 1 : -1);
  var STW = word_from([
    0, 1, 2, 3, 4, 5, 6, 10 // enable
  ]);
  var s = to_speed(speed == undefined ? 1 : speed);
  var PZD = create_PZD(STW, s, increments >> 16, increments & 0xffff);
  var PKW = create_PKW(0, 0, 0);
  var PPO = create_PPO2(PKW, PZD);
  await sendTelegram(id, PPO);
};

exports.zero = async function (id) {
  await exports.set_revolutions(id, 0, 0.2);
};

exports.set_length = async function (id, length, speed) {
  var radius = WHEEL_RADIUS[id];
  var revs = length / (2.0*Math.PI*radius);
  //console.log("id", id, "length", length);
  await exports.set_revolutions(id, revs, speed);
};

exports.start_reference_run = async function (id, speed) {
  var STW = word_from([
    0, 1, 2, 3, 4, 5, 6, 10, // enable
    id == 0 ? 12 : 11, // SPECIAL CASE: motor 0 is different direction (ccw/cw)
    8 // reference run
  ]);
  var PZD = create_PZD(STW, to_speed(speed), 0, 0);
  var PKW = create_PKW(0, 0, 0);
  var PPO = create_PPO2(PKW, PZD);

  await sendTelegram(id, PPO);
};

exports.finish_reference_run = async function (id) {
  var STW = word_from([
    0, 1, 2, 3, 4, 5, 6, 10, // enable
    id == 0 ? 12 : 11, // SPECIAL CASE: motor 0 is different direction (ccw/cw)
    8, // reference run
    9 // hit home position
  ]);
  var PZD = create_PZD(STW, to_speed(0.05), 0, 0);
  var PKW = create_PKW(0, 0, 0);
  var PPO = create_PPO2(PKW, PZD);
  await sendTelegram(id, PPO);

  // This will toggle the 9:th bit off again and
  // complete the reference run. Think of bit 9
  // as a homing push button.
  await exports.start_reference_run(id, 0);

  // Need to do this to break out from reference
  // run squence. Can not do multiple reference
  // runs after each other otherwise.
  await exports.set_revolutions(id, 0);

  await exports.startup();
};

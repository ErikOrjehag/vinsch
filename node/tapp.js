var SerialPort = require("serialport");
var NanoTimer = require("nanotimer");
var util = require("util");
var MockBinding = SerialPort.Binding;

var timer = new NanoTimer();

var S_TO_N = 10e9

var baudRate = 9600;
var charDur = (11. / baudRate) * S_TO_N;
var tSP = 2 * charDur;
var tSPstr = util.format("%du", Math.round(tSP))

console.log(tSPstr);

var device = "/dev/null"
//var device = "/dev/cu.usbserial-FT1MJ3Q6";

var port = new SerialPort(device, {
  autoOpen: true,
  baudRate: baudRate,
  dataBits: 8,
  stopBits: 1,
  parity: 'even'
});

function sendTelegram(adress, data) {
  console.log("sendTelegram", adress, data.map((d) => d.toString(16)));

  var STX = 0x2; // Start byte

  var LEN = data.length; // Data legth byte

  var echo = 0; // Should slave respond with echo?
  var broadcast = 0; // Broadcast to all slave?
  var ADR = (echo << 6) | (broadcast << 5) | adress;

  // The telegram message
  var msg = [STX, LEN, ADR].concat(data);

  // XOR check-sum
  var BCC = msg.slice(1).reduce((acc, val) => acc ^ val, msg[0]);

  msg.push(BCC);

  timer.setTimeout(() => {
    port.write(new Buffer(msg));
  }, null, tSPstr);
}

function from_bits(bits) {
  return bits.reduce((acc, position) => acc | (1 << position), 0);
}

function create_PZD(STW, SW1) {
  return (STW << 16) | SW1;
}

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on('data', function(key) {

  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }

  var addr = 0

  if (key === 'a') { // Standby
    var PZD = create_PZD(
      from_bits([1, 2, 3, 4, 5, 6, 10]),
      from_bits([])
    );

    console.log(PZD.toString(16));

    var data = [0, 0, 0, 0, 0, 0, PZD>>24, (PZD>>16)&0xff, (PZD>>8)&0xff, PZD&0xff];

    sendTelegram(addr, data);

  } else if (key === 'b') {
    var PZD = create_PZD(
      from_bits([0, 1, 2, 3, 4, 5, 6, 10]),
      0x2000
    );

    console.log(PZD.toString(16));

    var data = [0, 0, 0, 0, 0, 0, PZD>>24, (PZD>>16)&0xff, (PZD>>8)&0xff, PZD&0xff];

    sendTelegram(addr, data);
  }



});

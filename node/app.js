var SerialPort = require("serialport");
var NanoTimer = require("nanotimer");
var util = require("util");
var MockBinding = SerialPort.Binding;

var timer = new NanoTimer();

var S_TO_N = 10e9

var baudRate = 9600;
var charDur = (11. / baudRate) * S_TO_N;
var tSP = 2 * charDur;

console.log(charDur)

var port = new SerialPort("/dev/cu.usbserial-FT1MJ3Q6", {
  autoOpen: true,
  baudRate: baudRate,
  dataBits: 8,
  stopBits: 1,
  parity: 'even'
});

function sendTelegram(adress, data) {

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

  port.write(new Buffer(msg));

  var sendByte = function(msg) {
    if (msg.length > 0) {
      port.write(new Buffer([msg[0]]));
      msg = msg.slice(1);
      timer.setTimeout(() => {
        sendByte(msg);
      }, null, util.format("%du", Math.round(charDur)));
    }
  }

  timer.setTimeout(() => {
    sendByte(msg);
  }, null, util.format("%du", Math.round(tSP)));
}

sendTelegram(0, [1, 2, 8]);

//port.write(new Buffer([0xf0, 0xfa, 0xfe]));

setTimeout(function() {
  console.log("bye")
}, 1000)




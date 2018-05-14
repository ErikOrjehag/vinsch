var SerialPort = require("serialport");
var NanoTimer = require("nanotimer");
var util = require("util");
var MockBinding = SerialPort.Binding;

var timer = new NanoTimer();

var baudRate = 9600; // 38400
/*var S_TO_N = 10e9
var charDur = (11. / baudRate) * S_TO_N;
var tSP = 2 * charDur;
var tSPstr = util.format("%du", Math.round(tSP))*/

var deviceInverter = "/dev/null" // "/dev/cu.usbserial-FT1MJ3Q6";
var deviceEncoder = "/dev/null"

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
  if (readbuf.length == 16) {
    console.log('Response:', readbuf);
    readbuf = new Buffer([]);
  }
});

function sendTelegram(address, data) {

  var STX = 0x2; // Start byte

  var LEN = data.length + 2; // Lenght of (ADDR + data.. + BCC)

  var echo = 0; // Should slave respond with echo?
  var broadcast = 0; // Broadcast to all slave?
  var ADDR = (echo << 6) | (broadcast << 5) | address;

  // The telegram message
  var msg = [STX, LEN, ADDR].concat(data);

  // XOR check-sum
  var BCC = msg.slice(1).reduce((acc, val) => acc ^ val, msg[0]);

  msg.push(BCC);

  var buff = new Buffer(msg)

  console.log("sendTelegram", address, buff);

  portInverter.write(buff);
}

function word_from(bits) {
  return bits.reduce((acc, position) => acc | (1 << position), 0);
}

function create_PZD(STW, SW1) {
  return (STW << 16) | SW1;
}

function create_PPO1(PKW, PZD) {
  return [0, 0, 0, 0, 0, 0, 0, 0, PZD>>24, (PZD>>16)&0xff, (PZD>>8)&0xff, PZD&0xff];
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

  var data = null

  if (key === 'a') { // Standby example

    var PZD = create_PZD(word_from([1, 2, 3, 4, 5, 6, 10]), 0);
    var data = create_PPO1(null, PZD);

  } else if (key === 'b') { // Setpoint 50% example

    var PZD = create_PZD(word_from([0, 1, 2, 3, 4, 5, 6, 10]), 0x2000);
    var data = create_PPO1(null, PZD);

  } else if (key === '1') {  // Go from "Switch-on disabled" -> "Ready for switch-on"

    var PZD = create_PZD(word_from([1, 2, 10]), 0);
    var data = create_PPO1(null, PZD);

  } else if (key === '2') { // 50% right

    var PZD = create_PZD(word_from([0, 1, 2, 3, 4, 5, 6, 10, 11]), 0x2000);
    var data = create_PPO1(null, PZD);

  } else if (key === '3') { // 50% left

    var PZD = create_PZD(word_from([0, 1, 2, 3, 4, 5, 6, 10, 12]), 0x2000);
    var data = create_PPO1(null, PZD);

  }

  var addr = 0
  sendTelegram(addr, data);

});

var portEncoder = new SerialPort(deviceEncoder);

portEncoder.on('error', function(err) {
  console.log('Error encoder port: ', err.message);
});

portEncoder.on("data", function (data) {
  console.log("encoder:", data);
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on("knob", function (degrees) {
    console.log(degrees);
  });
});

http.listen(8080, function () {
  console.log('listening on port 8080');
});

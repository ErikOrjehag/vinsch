var SerialPort = require("serialport");
var Readline = SerialPort.parsers.Readline

var baudRate = 38400; // 38400 9600
var deviceInverter = "/dev/ttyUSB0" // "/dev/cu.usbserial-FT1MJ3Q6";

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
    console.log('Response:', readbuf);
    readbuf = new Buffer([]);
  }
});

function sendTelegram(to, PPO) {

  var STX = 0x2; // Start byte

  var LEN = PPO.length + 2; // Lenght of (ADDR + PPO.. + BCC)

  var echo = 0; // Should slave respond with echo?
  var broadcast = (to == null) ? 1 : 0; // Broadcast to all slaves?
  var address = (to == null) ? 0 : to;
  var ADDR = (echo << 6) | (broadcast << 5) | address;

  // The telegram message
  var msg = [STX, LEN, ADDR].concat(PPO);

  // XOR check-sum
  var BCC = msg.slice(1).reduce((acc, val) => acc ^ val, msg[0]);

  msg.push(BCC);

  var buff = new Buffer(msg)

  console.log("sendTelegram", to, buff);

  portInverter.write(buff);
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

function set_position(revolutions) {
  var increments = Math.round(revolutions * 1000);
  var STW = word_from([0, 1, 2, 3, 4, 5, 6, 10, 12]);
  var PZD = create_PZD(STW, 0, increments >> 16, increments & 0xffff);
  var PKW = create_PKW(0, 0, 0);
  var PPO = create_PPO2(PKW, PZD);
  sendTelegram(addr, PPO);
}

function create_PPO2(PKW, PZD) {
  return PKW.concat(PZD);
}

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding( 'utf8' );

var uiControl = false;
var addr = null;
var pos = 0;
var interval;
var toggle = false;

// on any data into stdin
stdin.on('data', function(key) {

  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }

  var data = null

  if (key === 'q') // Go from "Switch-on disabled" -> "Ready for switch-on"
  {
    uiControl = false;
    var STW = word_from([1, 2, 10]);
    var PZD = create_PZD(STW, 0, 0, 0);
    var PKW = create_PKW(0, 0, 0);
    var PPO = create_PPO2(PKW, PZD);
    sendTelegram(null, PPO);
  }
  else if (key === 'p') // Start UI control
  {
    uiControl = true;
  }
  else if (key === 'a')
  {
    set_position(0);
  }
  else if (key === 'b')
  {
    set_position(0.25);
  }
  else if (key === 'c')
  {
    if (interval) {
      clearInterval(interval);
    } else {
      interval = setInterval(function () {
        if (toggle) {
          set_position(0.3);
        } else {
          set_position(-0.3);
        }
        toggle = !toggle;
      }, 5000);
    }
  }
  else if (key === '0')
  {
    addr = 0;
  }
  else if (key === '1')
  {
    addr = 1;
  }
  else if (key === '2')
  {
    addr = 2;
  }
  else if (key === '3')
  {
    addr = 3;
  }
  else if (key === '4')
  {
    addr = null;
  }
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var knobAngle = 0;

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("knob", function (degrees) {
    if (uiControl) {
      console.log("knob:", degrees);
      knobAngle = degrees;
    }
  });

});

http.listen(8080, function () {
  console.log('listening on port 8080');
});


setInterval(function () {
  if (uiControl) {
    var increments = Math.round((knobAngle / 360.0) * 1000);
    var STW = word_from([0, 1, 2, 3, 4, 5, 6, 10, 12]);
    var PZD = create_PZD(STW, 0, increments >> 16, increments & 0xffff);
    var PKW = create_PKW(0, 0, 0);
    var PPO = create_PPO2(PKW, PZD);
    sendTelegram(addr, PPO);
  }
}, 100);

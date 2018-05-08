var SerialPort = require("serialport");
var MockBinding = SerialPort.Binding;

var baudRate = 9600;
var charDur = 11. / baudRate;
var tSP = 2 * charDur;

var port = new SerialPort("/dev/null", {
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

  var sendByte = function(msg) {
    if (msg.length > 0) {
      port.write(new Buffer([msg[0]]));
      msg = msg.slice(1);
      setTimeout(() => {
        sendByte(msg);
      }, charDur);
    }
  }

  setTimeout(() => {
    sendByte(msg);
  }, tSP);
}

sendTelegram(0, [1, 2, 3]);

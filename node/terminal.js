/*
  Terminal interface, useful during
  development and debugging. Press
  keys in the terminal window to
  activate commands.
*/

var inverter = require('./inverter');
var geom = require('./geom');
var move = require('./move');

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

// on any data into stdin
stdin.on('data', function (key) {

  // ctrl-c ( end of text )
  if (key === '\u0003') {
    process.exit();
  }
  else if (key === 'q')
  {
    inverter.startup();
  }
  else if (key === 'p')
  {
    move.play();
  }
});

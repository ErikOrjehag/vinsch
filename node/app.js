/*
  Vinsch entry point.
*/

var db = require('./db');
var socket = require('./socket');
var rest = require('./rest');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var parser = require('body-parser');

app.use(parser.json());
app.use(express.static('public'));

socket.interface(io);
rest.interface(app);
require('./io');

http.listen(3000, function () {
  console.log('listening on port 3000');
});

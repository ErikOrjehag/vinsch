/*
  Vinsch entry point.
*/

//var db = require('./db');
require('./terminal');
var socket = require('./socket');

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

socket(io);

http.listen(3000, function () {
  console.log('listening on port 3000');
});

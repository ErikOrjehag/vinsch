
var degrees = 0;

var socket = io();

$(function() {
  var v = 0;
  var up = false;
  var down = false;
  var step = 1;

  $(".dial").knob({
    // Settings
    min: 0,
    max: 360,
    step: step,
    stopper : false,
    // Visual
    displayInput: false,
    width: 200,
    height: 200,
    cursor: 30,
    // Hook
    change : function () {
      var d = this.cv - v;
      if (d != 0) {
        if (d > 180) d -= 360;
        else if (d < -180) d += 360;
        v = this.cv;
        degrees += d;
        console.log(degrees);
        socket.emit("knob", degrees);
      }
    }
  });
});

$("#start-reference-run").click(function () {
  var id = parseInt($("#select-inverter").val());
  socket.emit("start-reference-run", id);
});

$("#finish-reference-run").click(function () {
  var id = parseInt($("#select-inverter").val());
  socket.emit("finish-reference-run", id);
});

$("#home-specific").click(function () {
  var id = parseInt($("#select-inverter").val());
  socket.emit("home-specific", id);
});

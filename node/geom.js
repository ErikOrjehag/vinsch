
var inverter = require("./inverter.js");
var utils = require("./utils.js");
var socket = require("./socket.js");
var db = require("./db.js");

// # # # These parameters are fetched from the database # # #

// The layout of the rope pulleys
var pp = [
  { x: 1.82, y: 2.06, z: 2.37 },
  { x: 1.82, y: -2.06, z: 2.37 },
  { x: -1.82, y: -2.06, z: 2.37 },
  { x: -1.97, y: 2.06, z: 2.37 }
];

// The home position
var home = { x: 0, y: 0, z: 0.5 };

// Multiplier to compensate for slack in the ropes, a lower value will tighten
var SLACK = 1.0;

// Where we want to be
var setpoint = { x: 0, y: 0, z: 0 };

exports.get_setpoint = function () {
  return setpoint;
};

// # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

// Used to implement linear_to function, that cuts up motion into small steps.
var linear_active = false;

exports.is_linear_active = function () {
  return linear_active;
};

// Helper to get current time in seconds
function time() {
  return Date.now() / 1000.0;
}

// Fetch from database once on startup
setTimeout(function () {
  db.get_setpoint(function (err, point) {
    if (err) console.log(err);
    else {
      setpoint.x = point.x;
      setpoint.y = point.y;
      setpoint.z = point.z;
      console.log("setpoint", setpoint);
    }
  });

  db.get_layout(function (err, layout) {
    if (err) console.log(err);
    else exports.set_layout(layout);
  });
}, 100);

exports.set_layout = function (layout) {
  pp = layout.inverters;
  home = layout.home;
  SLACK = layout.slack;
  console.log("home", home);
  console.log("inverters", pp);
  console.log("slack", SLACK);
};

async function go_to_specific(id, point, speed) {

  if (speed == undefined) speed = 1;

  // Pythagoras
  var a = Math.sqrt(
    Math.pow(point.x - pp[id].x, 2) +
    Math.pow(point.y - pp[id].y, 2));
  var b = pp[id].z - point.z;
  var c = Math.sqrt(a*a + b*b) * SLACK;

  await inverter.set_length(id, c, speed);
};

exports.home_specific = async function (id) {
  await exports.init();
  await go_to_specific(id, home, 0.2);
};

exports.go_to = async function (point, speed) {
  setpoint.x = point.x;
  setpoint.y = point.y;
  setpoint.z = point.z;

  socket.send_position(setpoint);

  for (var i = 0; i < 4; i++) {
    await go_to_specific(i, setpoint, speed);
  }
};

exports.home = function () {
  exports.linear_to(home);
};

exports.increment_setpoint = async function (delta) {
  new_point = {
    x: setpoint.x + delta.x,
    y: setpoint.y + delta.y,
    z: setpoint.z + delta.z
  };
  await exports.go_to(new_point);
};

exports.stop = async function () {
  linear_active = false;
  await utils.wait(50);
  await inverter.startup();
  db.store_setpoint(setpoint);
};

exports.init = async function () {
  await inverter.startup();
};

exports.linear_to = async function (point) {

  if (linear_active) return;
  linear_active = true;

  await exports.init();

  var ts = time();
  var from = {
    x: setpoint.x,
    y: setpoint.y,
    z: setpoint.z
  };
  var to = point;

  var meters_per_second = 0.5;
  var distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2) +
    Math.pow(to.z - from.z, 2)
  );
  var duration = distance / meters_per_second;

  if (distance > 0.05) {
    while (linear_active) {
      var elapsed = time() - ts;
      var progress = Math.min(1, elapsed / duration);
      var carrot = {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
        z: from.z + (to.z - from.z) * progress
      }

      await exports.go_to(carrot);

      if (elapsed - duration > 0.8) {
        break;
      }
    }
  }

  await exports.stop();

  linear_active = false;
};

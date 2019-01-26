
var inverter = require("./inverter.js");
var utils = require("./utils.js");
var socket = require("./socket.js");
var db = require("./db.js");

var pp = {
  "TRI": [
    { x: 1.82, y: 0.1, z: 2.37 },
    { x: 1.82, y: 0, z: 2.37 },
    { x: -1.82, y: -2.06, z: 2.37 },
    { x: -1.82, y: 2.06, z: 2.37 }
  ],
  "QUAD": [
    { x: 1.82, y: 2.06, z: 2.37 },
    { x: 1.82, y: -2.06, z: 2.37 },
    { x: -1.82, y: -2.06, z: 2.37 },
    { x: -1.97, y: 2.06, z: 2.37 }
  ]
};

var home = { x: 0, y: 0, z: 0.5 };

var mode = "QUAD";

var SLACK = 1.0;
var setpoint = { x: 0, y: 0, z: 0 };

var linear_active = false;

function time() {
  return Date.now() / 1000.0;
}

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

exports.get_setpoint = function () {
  return setpoint;
};

exports.set_layout = function (layout) {
  pp["QUAD"] = layout.inverters;
  home = layout.home;
  SLACK = layout.slack;
  console.log("home", home);
  console.log("inverters", pp["QUAD"]);
  console.log("slack", SLACK);
};

async function go_to_specific(id, point, speed, h) {
  var p = pp[mode];

  if (mode == "TRI") {
    if (h == undefined) h = Math.min(p[1].z, p[2].z, p[3].z) - 1.0;
  } else if (mode == "QUAD") {
    h = point.z;
  }

  if (speed == undefined) speed = 1;

  var a = Math.sqrt(
    Math.pow(point.x - p[id].x, 2) +
    Math.pow(point.y - p[id].y, 2));
  var b = p[id].z - h;
  var c = Math.sqrt(a*a + b*b) * SLACK;

  var len = 0;

  if (mode == "TRI") {
    if (id == 0) {
      var l = h - point.z;
      len = c + 1;
    } else {
      len = c;
    }
  } else if (mode == "QUAD") {
      //console.log(id)
      len = c;
  }

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

  var p = pp[mode];

  var pad = 0.7;

  x_pos_bound = Math.min(p[0].x, p[1].x) - pad;
  x_neg_bound = Math.max(p[2].x, p[3].x) + pad;
  y_pos_bound = Math.min(p[0].y, p[3].y) - pad;
  y_neg_bound = Math.max(p[1].y, p[2].y) + pad;
  z_pos_bound = 1.0 * Math.min(p[0].z, p[1].z, p[2].z, p[3].z);

  if (setpoint.x > x_pos_bound) { console.warn("setpoint.x out of positive bounds!"); setpoint.x = x_pos_bound; }
  if (setpoint.x < x_neg_bound) { console.warn("setpoint.x out of negative bounds!"); setpoint.x = x_neg_bound; }
  if (setpoint.y > y_pos_bound) { console.warn("setpoint.y out of positive bounds!"); setpoint.y = y_pos_bound; }
  if (setpoint.y < y_neg_bound) { console.warn("setpoint.y out of negative bounds!"); setpoint.y = y_neg_bound; }
  if (setpoint.z > z_pos_bound) { console.warn("setpoint.z out of positive bounds!"); setpoint.z = z_pos_bound; }

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

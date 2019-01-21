
var inverter = require("./inverter.js");
var utils = require("./utils.js");
var socket = require("./socket.js");
var db = require("./db.js");

var pp = {
  "TRI": {
    "0": { x: 1.82, y: 0.1, z: 2.37 },
    "1": { x: 1.82, y: 0, z: 2.37 },
    "2": { x: -1.82, y: -2.06, z: 2.37 },
    "3": { x: -1.82, y: 2.06, z: 2.37 }
  },
  "QUAD": {
    "0": { x: 1.82, y: 2.06, z: 2.37 },
    "1": { x: 1.82, y: -2.06, z: 2.37 },
    "2": { x: -1.82, y: -2.06, z: 2.37 },
    "3": { x: -1.82 - 0.15, y: 2.06, z: 2.37 }
  }
};

var home = { x: 0, y: 0, z: 0.5 };

var mode = "QUAD";

var SLACK = 1.0;
var setpoint = { x: 0, y: 0, z: 0 };

setTimeout(function () {
  db.get_setpoint(function (err, point) {
    if (err) console.log(err);
    else {
      setpoint.x = point.x;
      setpoint.y = point.y;
      setpoint.z = point.z;
    }
  });
}, 100);

function go_to_specific(id, point, speed, h) {
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
      console.log(id)
      len = c;
  }

  inverter.set_length(id, c, speed);

};

exports.get_setpoint = function () {
  return setpoint;
}

exports.home_specific = function (id) {
  go_to_specific(id, home, 0.2);
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
  z_pos_bound = Math.min(p[0].z, p[1].z, p[2].z, p[3].z) - pad;

  if (setpoint.x > x_pos_bound) { console.warn("setpoint.x out of positive bounds!"); setpoint.x = x_pos_bound; }
  if (setpoint.x < x_neg_bound) { console.warn("setpoint.x out of negative bounds!"); setpoint.x = x_neg_bound; }
  if (setpoint.y > y_pos_bound) { console.warn("setpoint.y out of positive bounds!"); setpoint.y = y_pos_bound; }
  if (setpoint.y < y_neg_bound) { console.warn("setpoint.y out of negative bounds!"); setpoint.y = y_neg_bound; }
  if (setpoint.z > z_pos_bound) { console.warn("setpoint.z out of positive bounds!"); setpoint.z = z_pos_bound; }

  for (var i = 0; i < 4; i++) {
    go_to_specific(i, setpoint, speed);
    await utils.wait(22);
  }
};

exports.home = function () {
  exports.go_to(home, 0.2);
};

exports.increment_setpoint = async function (delta) {
  new_point = {
    x: setpoint.x + delta.x,
    y: setpoint.y + delta.y,
    z: setpoint.z + delta.z
  };
  await exports.go_to(new_point);
}

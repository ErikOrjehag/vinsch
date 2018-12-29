
var inverter = require("./inverter.js");
var utils = require("./utils.js");

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

var SLACK = 0.96;
var state = { x: 0, y: 0, z: 0 };

function go_to_specific(id, point, h) {
  var p = pp[mode];

  if (mode == "TRI") {
    if (h == undefined) h = Math.min(p[1].z, p[2].z, p[3].z) - 0.0;
  } else if (mode == "QUAD") {
    h = point.z;
  }

  var a = Math.sqrt(
    Math.pow(point.x - p[id].x, 2) +
    Math.pow(point.y - p[id].y, 2));
  var b = p[id].z - h;
  var c = Math.sqrt(a*a + b*b) * SLACK;

  if (mode == "TRI") {
    if (id == 0) {
      var l = h - point.z;
      inverter.set_length(id, c + l);
    } else {
      inverter.set_length(id, c);
    }
  } else if (mode == "QUAD") {
      console.log(id)
      inverter.set_length(id, c);
  }

};

exports.home_specific = function (id) {
  go_to_specific(id, home);
};

exports.go_to = async function (point) {
  state.x = point.x;
  state.y = point.y;
  state.z = point.z;

  var p = pp[mode];

  var pad = 0.7;

  x_pos_bound = Math.min(p[0].x, p[1].x) - pad;
  x_neg_bound = Math.max(p[2].x, p[3].x) + pad;
  y_pos_bound = Math.min(p[0].y, p[3].y) - pad;
  y_neg_bound = Math.max(p[1].y, p[2].y) + pad;
  z_pos_bound = Math.min(p[0].z, p[1].z, p[2].z, p[3].z) - pad;

  if (state.x > x_pos_bound) { console.warn("state.x out of positive bounds!"); state.x = x_pos_bound; }
  if (state.x < x_neg_bound) { console.warn("state.x out of negative bounds!"); state.x = x_neg_bound; }
  if (state.y > y_pos_bound) { console.warn("state.y out of positive bounds!"); state.y = y_pos_bound; }
  if (state.y < y_neg_bound) { console.warn("state.y out of negative bounds!"); state.y = y_neg_bound; }
  if (state.z > z_pos_bound) { console.warn("state.z out of positive bounds!"); state.z = z_pos_bound; }

  for (var i = 0; i < 4; i++) {
    go_to_specific(i, state);
    await utils.wait(50);
  }
};

exports.home = function () {
  exports.go_to(home);
};

exports.move = async function (delta) {
  new_point = {
    x: state.x + delta.x,
    y: state.y + delta.y,
    z: state.z + delta.z
  };
  await exports.go_to(new_point);
};


var inverter = require("./inverter.js");
var utils = require("./utils.js");

var p = {
  "0": {
    x: 1.89,
    y: 0.1,
    z: 2.37
  },
  "1": {
    x: 1.89,
    y: 0,
    z: 2.37
  },
  "2": {
    x: -1.89,
    y: -2.05,
    z: 2.37
  },
  "3": {
    x: -1.89,
    y: 2.05,
    z: 2.37
  },
  "home": {
    x: 0,
    y: 0,
    z: 2.0
  }
}

var H = Math.min(p[1].z, p[2].z, p[3].z) - 0.0;
var SLACK = 0.96;
var state = { x: 0, y: 0, z: 0 };

function go_to_specific(id, point, h) {
  state.x = point.x;
  state.y = point.y;
  state.z = point.z;

  if (h == undefined) h = H;

  var a = Math.sqrt(
    Math.pow(point.x - p[id].x, 2) +
    Math.pow(point.y - p[id].y, 2));
  var b = p[id].z - h;
  var c = Math.sqrt(a*a + b*b) * SLACK;

  if (id !== 0) {
    inverter.set_length(id, c);
  } else {
    var l = h - point.z;
    inverter.set_length(id, c + l);
  }
};

exports.home_specific = function (id) {
  go_to_specific(id, p["home"]);
};

exports.go_to = async function (point) {
  for (var i = 0; i < 4; i++) {
    go_to_specific(i, point);
    await utils.wait(50);
  }
};

exports.home = function () {
  exports.go_to(p["home"]);
};

exports.move = async function (delta) {
  new_point = {
    x: state.x + delta.x,
    y: state.y + delta.y,
    z: state.z + delta.z
  };
  await exports.go_to(new_point);
};

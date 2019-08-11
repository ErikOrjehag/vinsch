var geom = require('./geom');
var socket = require('./socket');
var db = require('./db');
var utils = require('./utils');

function default_status() {
  return {
    showIndex: -1,
    keyframeIndex: -1,
    showId: null,
    compositionId: null,
  };
}

var status = default_status();

var playing = false;

function time() {
  return Date.now() / 1000.0;
}

exports.get_status = function () {
  return status;
}

exports.stop = function () {
  if (playing) {
    playing = false;
  } else {
    geom.stop();
  }
}

exports.play = async function (setup) {

  console.log("Play!");

  var list = setup.composition.list;

  // Sanity check
  if (playing) return;
  if (list.length == 0) return;
  for (var i = 0; i < list.length; i++) {
    if (list[i].show.keyframes.length < 2) {
      return
    }
  }

  console.log("Sequence:", list.map(item => item.show.name));
  console.log("Start:", setup.start)

  playing = true;

  await geom.init();

  status.showIndex = setup.start.showIndex;
  status.keyframeIndex = setup.start.keyframeIndex + 1;
  status.showId = list[status.showIndex].show._id;
  status.compositionId = setup.composition._id;

  var ts = time();
  var prev = list[status.showIndex].show.keyframes[status.keyframeIndex - 1];
  var target = list[status.showIndex].show.keyframes[status.keyframeIndex];

  var scale = list[status.showIndex].scale;
  var offset = list[status.showIndex].offset;
  prev.pos.x *= scale.x; prev.pos.x += offset.x;
  prev.pos.y *= scale.y; prev.pos.y += offset.y;
  prev.pos.z *= scale.z; prev.pos.z += offset.z;

  socket.send_player_status(status);

  console.log("First show: ", list[status.showIndex].show.name);

  while (playing) {
    var elapsed = time() - ts;
    var progress = elapsed / target.time;
    var carrot = {
      x: prev.pos.x + (target.pos.x - prev.pos.x) * progress,
      y: prev.pos.y + (target.pos.y - prev.pos.y) * progress,
      z: prev.pos.z + (target.pos.z - prev.pos.z) * progress
    }

    await geom.go_to(carrot);

    var overshoot = elapsed - target.time;
    if (overshoot > 0) {
      status.keyframeIndex++;
      if (status.keyframeIndex == list[status.showIndex].show.keyframes.length) {
        status.keyframeIndex = -1;
        // Next show
        status.showIndex++;
        if (status.showIndex == list.length) {
          // No more shows
          status.showIndex = -1;
          break;
        } else {
          // There is another show
          console.log("Continue width: ", list[status.showIndex].show.name);
          offset = list[status.showIndex].offset;
          scale = list[status.showIndex].scale;
          status.showId = list[status.showIndex].show._id;
          Object.assign(prev, target);
          status.keyframeIndex = 0;
          target = list[status.showIndex].show.keyframes[status.keyframeIndex];

        }
      } else {
        Object.assign(prev, target);
        target = list[status.showIndex].show.keyframes[status.keyframeIndex];
      }

      target.pos.x *= scale.x; target.pos.x += offset.x;
      target.pos.y *= scale.y; target.pos.y += offset.y;
      target.pos.z *= scale.z; target.pos.z += offset.z;

      ts = time() - overshoot;
      socket.send_player_status(status);
    }
  }

  await utils.wait(2000);

  playing = false;

  status = default_status();

  socket.send_player_status(status);

  await geom.stop();
};

exports.play_default = function () {
  db.get_default_show(function (err, show) {
    if (err) console.log(err);
    else exports.play({
      start: 0,
      show: show
    });
  });
};

exports.goto_first_keyframe = function () {
  db.get_default_show(function (err, show) {
    if (err) console.log(err);
    else geom.linear_to(show.keyframes[0].pos);
  });
};

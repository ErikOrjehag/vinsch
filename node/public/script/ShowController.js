
app.controller('ShowController', function ($scope, socket, $routeParams, $http) {

  var id = $routeParams.id;
  var DoNothing = function () {};
  var OnShowRecieved = DoNothing;

  $scope.model = {
    pos: { x: 0, y: 0, z: 0 },
    selected: -1,
    current: -1,
    playing: false,
    control: false,
    tooltip: -1,
    speed: 0.5
  };

  $scope.prettyModel = function () {
    return JSON.stringify($scope.model, null, 2);
  };

  $scope.onTooltip = function (index) {
    console.log(index);
    $scope.model.tooltip = index;
  };

  $scope.offTooltip = function () {
    console.log("off");
    $scope.model.tooltip = -1;
  };

  function showDeepCopy() {
    return jQuery.extend(true, {}, $scope.model.show);
  }

  $scope.$watch('model.control', function () {
    $scope.model.selected = -1;
  });

  socket.on('show-'+id, function (show) {
    if (!show.keyframes) show.keyframes = [];
    console.log("received show");
    $scope.model.show = show;
    OnShowRecieved();
  });

  socket.on('current-'+id, function (index) {
    console.log('current', index);
    $scope.model.current = index;
  });

  socket.on('playing-'+id, function (playing) {
    console.log('playing', playing);
    $scope.model.playing = playing;
  });

  socket.on("position", function (position) {
    $scope.model.pos = position;
  });

  $scope.$on("$destroy", function () {
    socket.off("show-"+id);
    socket.off("current-"+id);
    socket.off("playing-"+id);
    socket.off("position");
    $scope.stopShow();
  });

  $scope.updatePosition = function (index) {
    console.log("position:", index);
    var show = showDeepCopy();
    show.keyframes[index].pos = $scope.model.pos;
    socket.emit("set-show", show);
    $scope.model.selected = -1;
    $scope.model.tooltip = -1;
  };

  $scope.editPosition = function (index, add) {
    console.log("edit position:", index);
    $scope.model.selected = -1;
    $scope.model.tooltip = -1;

    show = showDeepCopy();

    var pos = show.keyframes[index].pos;
    var defaultValue = (pos.x.toFixed(2) + " " +
                        pos.y.toFixed(2) + " " +
                        pos.z.toFixed(2));

    var title = 'Enter position for #'+(index+1)+' like x y z';

    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Ok' },
      { name: 'next', text: 'Ok + ' + (add?'add after':'edit next') },
    ];

    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log("resp", resp)
      if (resp.button.name !== 'cancel') {
        var inPos = (resp.text + "").split(" ").map(function (num) { return parseFloat(num) });
        if (inPos.length == 3 && !isNaN(inPos[0]) && !isNaN(inPos[1]) && !isNaN(inPos[2])) {
          pos.x = inPos[0];
          pos.y = inPos[1];
          pos.z = inPos[2];
        }

        if (resp.button.name === 'ok') {
          OnShowRecieved = DoNothing;
        } else if (resp.button.name === 'next') {
          if (add) {
            OnShowRecieved = function () {
              $scope.addAfter(index);
            };
          } else {
            OnShowRecieved = function () {
              $scope.editPosition(index+1, false);
            }
          }
        }

        socket.emit("set-show", show);
      }
    });
  };

  function calcTime(p1, p2) {
    var dist = Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
      Math.pow(p1.y - p2.y, 2) +
      Math.pow(p1.z - p2.z, 2));
    var time = parseFloat((dist / $scope.model.speed).toFixed(1));
    if (time == 0) time = 10;
    return time;
  };

  $scope.timeFromSpeed = function (index) {
    if (index < 1) return;
    console.log("update time:", index);
    $scope.model.selected = -1;
    var show = showDeepCopy();
    var time = calcTime(show.keyframes[index-1].pos, show.keyframes[index].pos);
    show.keyframes[index].time = time;
    socket.emit("set-show", show);
    $scope.model.tooltip = -1;
  };

  $scope.addAfter = function (index) {
    console.log("add after:", index);
    $scope.model.selected = -1;
    $scope.model.tooltip = -1;
    var show = showDeepCopy();
    var time = 3;
    if (index !== -1) {
      time = calcTime(show.keyframes[index].pos, $scope.model.pos);
    }
    show.keyframes.splice(index+1, 0, { pos: $scope.model.pos, time: time });

    OnShowRecieved = function () {
      $scope.editPosition(index+1, true);
    };

    socket.emit("set-show", show);
  };

  $scope.upKeyframe = function (index) {
    console.log("up:", index);
    $scope.model.selected = -1;
    $scope.model.tooltip -= 1;
    var show = showDeepCopy();
    show.keyframes.splice(index-1, 0, show.keyframes[index]);
    show.keyframes.splice(index+1, 1);
    socket.emit("set-show", show);
  };

  $scope.downKeyframe = function (index) {
    console.log("down:", index);
    $scope.model.selected = -1;
    $scope.model.tooltip += 1;
    var show = showDeepCopy();
    show.keyframes.splice(index+2, 0, show.keyframes[index]);
    show.keyframes.splice(index, 1);
    socket.emit("set-show", show);
  };

  $scope.deleteKeyframe = function (index) {
    console.log("delete:", index);
    $scope.model.selected = -1;
    $scope.model.tooltip = -1;
    var show = showDeepCopy();
    show.keyframes.splice(index, 1);
    socket.emit("set-show", show);
  };

  $scope.gotoKeyframe = function (index) {
    console.log("goto:", index);
    $scope.model.selected = index;
    $scope.model.tooltip = -1;
    socket.emit("goto", $scope.model.show.keyframes[index].pos);
  };

  $scope.changeTime = function () {
    if ($scope.form.$valid) {
      socket.emit("set-show", $scope.model.show);
    }
  };

  $scope.playShow = function () {
    // Sanity check
    if ($scope.model.selected < 0) return;
    if ($scope.model.selected > $scope.model.show.keyframes.length-2) return;
    if ($scope.model.show.keyframes.length < 2) return;

    console.log("play!");

    socket.emit("play-show", {
      start: $scope.model.selected,
      shows: [ $scope.model.show ]
    });

    $scope.model.selected = -1;
  };

  $scope.stopShow = function () {
    socket.emit("stop-show");
  };

  $scope.stop = function () {
    $scope.model.selected = -1;
    socket.emit("stop");
  };

  socket.emit('edit-show', id);

});

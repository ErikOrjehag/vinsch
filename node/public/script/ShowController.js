
app.controller('ShowController', function ($scope, socket, $routeParams) {

  var id = $routeParams.id;

  $scope.model = {
    pos: { x: 0, y: 0, z: 0 },
    selected: -1,
    current: -1,
    playing: false,
    control: false,
    tooltip: -1
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

  $scope.positionKeyframe = function (index) {
    console.log("position:", index);
    var show = showDeepCopy();
    show.keyframes[index].pos = $scope.model.pos;
    socket.emit("set-show", show);
    if (index == $scope.model.selected) $scope.model.selected = -1;
  };

  $scope.addAfter = function (index) {
    console.log("add after:", index);
    $scope.model.selected = -1;
    var show = showDeepCopy();
    show.keyframes.splice(index+1, 0, { pos: $scope.model.pos, time: 3 });
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
      show: $scope.model.show
    });

    $scope.model.selected = -1;
  };

  $scope.stopShow = function () {
    socket.emit("stop-show");
  };

  socket.emit('edit-show', id);

});

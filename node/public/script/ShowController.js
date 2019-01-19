
app.controller('ShowController', function ($scope, socket, $routeParams) {

  var id = $routeParams.id;

  $scope.model = {
    pos: { x: 0, y: 0, z: 0 },
    current: -1
  };

  function showDeepCopy() {
    return jQuery.extend(true, {}, $scope.model.show);
  }

  socket.emit('edit-show', id);

  socket.on('show-'+id, function (show) {
    console.log("received show");
    $scope.model.show = show;
  });

  socket.on("position", function (position) {
    $scope.model.pos = position;
  });

  $scope.$on("$destroy", function () {
    socket.off("show-"+id);
    socket.off("position");
  });

  $scope.addKeyframe = function () {
    console.log("add");
    var show = showDeepCopy();
    show.keyframes.push({ pos: $scope.model.pos, time: 5 })
    socket.emit("set-show", show);
  };

  $scope.positionKeyframe = function (index) {
    console.log("position:", index);
    var show = showDeepCopy();
    show.keyframes[index].pos = $scope.model.pos;
    socket.emit("set-show", show);
  };

  $scope.timeKeyframe = function (index) {
    console.log("time:", index);
    var input = parseFloat(window.prompt('Please enter time:'));
    if (!isNaN(input)) {
      var show = showDeepCopy();
      show.keyframes[index].time = input;
      socket.emit("set-show", show);
    } else {
      alert("Incorrect!");
    }
  };

  $scope.copyKeyframe = function (index) {
    console.log("copy:", index);
    var show = showDeepCopy();
    show.keyframes.splice(index, 0, show.keyframes[index]);
    socket.emit("set-show", show);
  };

  $scope.upKeyframe = function (index) {
    console.log("up:", index);
    var show = showDeepCopy();
    show.keyframes.splice(index-1, 0, show.keyframes[index]);
    show.keyframes.splice(index+1, 1);
    socket.emit("set-show", show);
  };

  $scope.downKeyframe = function (index) {
    console.log("down:", index);
    var show = showDeepCopy();
    show.keyframes.splice(index+2, 0, show.keyframes[index]);
    show.keyframes.splice(index, 1);
    socket.emit("set-show", show);
  };

  $scope.deleteKeyframe = function (index) {
    console.log("delete:", index);
    var show = showDeepCopy();
    show.keyframes.splice(index, 1);
    socket.emit("set-show", show);
  };

  $scope.gotoKeyframe = function (index) {
    console.log("goto:", index);
    socket.emit("goto", $scope.model.show.keyframes[index].pos);
  };

  $scope.playShow = function (index) {
    console.log("play!");
    socket.emit("play-show", $scope.model.show);
  }

});

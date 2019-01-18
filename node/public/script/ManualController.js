
app.controller('ManualController', function ($scope, socket) {

  $scope.model = {
    joyXY: [0, 0],
    joyZ: [0, 0]
  };

  $scope.home = function () {
    socket.emit("home");
  };

  $scope.stop = function () {
    socket.emit("stop");
  };

  var xy_init = false;
  var z_init = false;

  $scope.$watch('model.joyXY', function () {
    if (xy_init) move();
    xy_init = true;
  });

  $scope.$watch('model.joyZ', function () {
    if (z_init) move();
    z_init = true;
  });

  function move() {
    var factor = 0.1;
    socket.emit("move", {
      x: factor * $scope.model.joyXY[1],
      y: factor * $scope.model.joyXY[0] * -1,
      z: factor * $scope.model.joyZ[1]
    });
  }

});

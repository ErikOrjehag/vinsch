
app.controller('CalibrateController', function ($scope, socket) {

  $scope.model = {
    motors: ["0", "1", "2", "3"],
    selectedMotor: 0,
    joyXY: [0, 0],
    joyZ: [0, 0]
  };

  $scope.startReferenceRun = function () {
    console.log("startReferenceRun: %d", $scope.model.selectedMotor);
    socket.emit("start-reference-run", $scope.model.selectedMotor);
  };

  $scope.finishReferenceRun = function () {
    console.log("finishReferenceRun: %d", $scope.model.selectedMotor);
    socket.emit("finish-reference-run", $scope.model.selectedMotor);
  };

  $scope.homeSpecific = function () {
    console.log("homeSpecific: %d", $scope.model.selectedMotor);
    socket.emit("home-specific", $scope.model.selectedMotor);
  };

  $scope.zeroSpecific = function () {
    console.log("zeroSpecific: %d", $scope.model.selectedMotor);
    socket.emit("zero-specific", $scope.model.selectedMotor);
  };

  $scope.extendSpecific = function () {
    var delta = 0.1;
    console.log("extendSpecific: %d", $scope.model.selectedMotor, delta);
    socket.emit("extend-specific", {
      id: $scope.model.selectedMotor, delta: delta
    });
  };

  $scope.home = function () {
    socket.emit("home");
  };

  $scope.stop = function () {
    socket.emit("stop");
  };

  $scope.$watch('model.joyXY', function () {
    move();
  });

  $scope.$watch('model.joyZ', function () {
    move();
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

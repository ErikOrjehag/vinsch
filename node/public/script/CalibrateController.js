
app.controller('CalibrateController', function ($scope, socket) {

  $scope.model = {
    motors: ["0", "1", "2", "3"],
    selectedMotor: 0
  };

  $scope.fastRefRun = function () {
    console.log("fastRefRun: %d", $scope.model.selectedMotor);
    socket.emit("start-reference-run", {
      id: $scope.model.selectedMotor, speed: 0.2
    });
  };

  $scope.slowRefRun = function () {
    console.log("fastRefRun: %d", $scope.model.selectedMotor);
    socket.emit("start-reference-run", {
      id: $scope.model.selectedMotor, speed: 0.02
    });
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

  $scope.stop = function () {
    socket.emit("stop");
  };

});

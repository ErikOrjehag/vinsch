
app.controller('CalibrateController', function ($scope, socket) {

  $scope.model = {
    motors: ["0", "1", "2", "3"],
    selectedMotor: 0
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

  $scope.extendSpecific = function () {
    console.log("extendSpecific: %d", $scope.model.selectedMotor);
    socket.emit("extend-specific", $scope.model.selectedMotor);
  };

});

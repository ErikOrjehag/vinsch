
app.controller('ManualController', function ($scope, socket) {

  $scope.home = function () {
    socket.emit("home");
  };

  $scope.stop = function () {
    socket.emit("stop");
  };

});

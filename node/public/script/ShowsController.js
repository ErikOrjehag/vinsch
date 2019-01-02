
app.controller('ShowsController', function ($scope, socket) {

  $scope.model = {
    newShowName: ''
  };

  $scope.createShow = function () {
    console.log("create-show");
    socket.emit("create-show", $scope.model.newShowName);
    $scope.model.newShowName = '';
  };

});

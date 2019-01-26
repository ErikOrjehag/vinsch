
app.controller('LayoutController', function ($scope, $http) {
  $scope.model = {
    layout: {
      home: {},
      inverters: [],
      slack: null
    }
  };

  $http.get('/layout').then(function (resp) {
    $scope.model.layout = resp.data;
  }, function (err) {
    console.log(err);
    alert("Could not get current layout!");
  });

  $scope.prettyModel = function () {
    return JSON.stringify($scope.model, null, 2);
  };

  $scope.save = function () {
    if ($scope.form.$valid) {
      $http.post('/layout', $scope.model.layout).then(function (resp) {
        console.log(resp);
        alert("Update OK!");
      }, function () {
        alert("Update FAILED!");
      });
    }
  }
});

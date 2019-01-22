
app.directive('connectionNotification', function (socket, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
    },
    template: '<div class="warn-notify" ng-hide="connected">Warning: Not connected to system!</div>',
    link: function (scope, element, attr) {
      scope.connected = true;

      var tout = $timeout(function () {
        scope.connected = false;
      }, 100);

      socket.on("connect", function () {
        $timeout.cancel(tout);
        scope.connected = true;
      });

      socket.on("disconnect", function () {
        scope.connected = false;
      });
    }
  }
});


app.directive('joyControl', function (socket) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
    },
    template: '<div joystick is-1d output="model.joyZ"></div><div joystick output="model.joyXY"></div>',
    link: function (scope) {
      scope.model = {
        joyXY: [0, 0],
        joyZ: [0, 0]
      };

      var xy_init = false;
      var z_init = false;

      scope.$watch('model.joyXY', function () {
        if (xy_init) move();
        xy_init = true;
      });

      scope.$watch('model.joyZ', function () {
        if (z_init) move();
        z_init = true;
      });

      function move() {
        var factor = 0.1;
        socket.emit("move", {
          x: factor * scope.model.joyXY[1],
          y: factor * scope.model.joyXY[0] * -1,
          z: factor * scope.model.joyZ[1]
        });
      }
    }
  }
});

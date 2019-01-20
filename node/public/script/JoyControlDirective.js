
app.directive('joyControl', function (socket) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      active: "=?"
    },
    template: '<div style="display: inline-block; margin-right: 10px;"><div joystick is-1d output="model.joyZ"></div></div><div joystick output="model.joyXY"></div>',
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
        var x = scope.model.joyXY[1];
        var y = scope.model.joyXY[0];
        var z = scope.model.joyZ[1];
        socket.emit("move", {
          x: factor * x,
          y: factor * y * -1,
          z: factor * z
        });

        if (x == 0 && y == 0 && z == 0) {
          scope.active = false;
        } else {
          scope.active = true;
        }
      }
    }
  }
});


app.directive('joystick', function ($document) {
  return {
    restrict: 'A',
    replace: true,
    scope: {

    },
    template: '<div><div></div></div>',
    link: function (scope, element, attr) {
      var onedim = 'is1d' in attr;

      var container = element;
      var stick = container.children();
      var csizex = 100;
      var csizey = 100;
      var ssize = Math.floor(csizey / 2);

      if (onedim) {
        csizex = 4;
      }

      var midx = Math.floor((csizex - ssize) / 2);
      var midy = Math.floor((csizey - ssize) / 2);

      var x = 0;
      var y = 0;

      container.css({
        position: 'relative',
        background: '#bbb',
        borderRadius: '999px',
        width: csizex + 'px',
        height: csizey + 'px',
        display: 'inline-block',
        boxShadow: 'inset 0 0 10px #aaa',
      });

      stick.css({
        top: midy + 'px',
        left: midx + 'px',
        position: 'absolute',
        background: '#fff',
        borderRadius: '999px',
        width: ssize + 'px',
        height: ssize + 'px',
        boxShadow: '0 0 3px #888',
      });

      if (onedim) {
        var margin = Math.floor((csizey - csizex) / 2);
        container.css({
          marginLeft: margin + 'px',
          marginRight: margin + 'px',
          boxShadow: 'inset 0 0 2px #aaa',
        });
      }

      stick.on('mousedown', function(e) {
        e.preventDefault();
        $document.on('mousemove', eventmove);
        $document.on('mouseup', mouseup)
      });

      stick.on('touchstart', function(e) {
        e.preventDefault();
        $document.on('touchmove', touchmove);
        $document.on('touchend', touchup)
      });

      function mouseup(e) {
        eventup(e);
        $document.off('mousemove', eventmove);
        $document.off('mouseup', mouseup);
      }

      function touchup(e) {
        eventup(e);
        $document.off('touchmove', touchmove);
        $document.off('touchend', touchup);
      }

      function touchmove(e) {
        eventmove(e.changedTouches[0]);
      }

      function eventmove(e) {
        var x = 2*(e.pageX - container.offset().left - midx - ssize/2) / csizex;
        var y = 2*(e.pageY - container.offset().top - midy - ssize/2) / csizey;

        if (onedim) {
          x = 0;
        }

        var len = Math.sqrt(x*x + y*y);
        if (len > 1) {
          x /= len;
          y /= len;
        }

        stick.css({
          top: Math.floor(midy + y * csizey/2) + 'px'
        });
        if (!onedim) {
          stick.css({
            left: Math.floor(midx + x * csizex/2) + 'px'
          });
        }
      }

      function eventup(e) {
        stick.css({
          top: midy + 'px',
          left: midx + 'px'
        });
      }
    }
  }
});

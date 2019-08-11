
app.controller('CompositionController', function ($scope, socket, $routeParams, $http) {

  var id = $routeParams.id;

  $scope.model = {
    pos: { x: 0, y: 0, z: 0 },
    selected: null,
    playerStatus: null,
    tooltip: -1,
    composition: null,
    shows: null,
    selectedShow: null
  };

  /* * * * * * * * * * * * * * * *
             HELPERS
  * * * * * * * * * * * * * * * */

  $scope.prettyModel = function () {
    return JSON.stringify($scope.model, null, 2);
  };

  function compositionDeepCopy() {
    return jQuery.extend(true, {}, $scope.model.composition);
  }

  $scope.showsFromComposition = function(composition) {
    if (!composition) return [];
    return composition.list.map(function (item) {
      return $scope.model.shows.filter(function (show) {
        return show._id == item.show;
      })[0];
    })
  };

  /* * * * * * * * * * * * * * * *
              TOOLTIP
  * * * * * * * * * * * * * * * */

  $scope.onTooltip = function (index) {
    console.log(index);
    $scope.model.tooltip = index;
  };

  $scope.offTooltip = function () {
    console.log("off");
    $scope.model.tooltip = -1;
  };

  /* * * * * * * * * * * * * * * *
              SOCKET
  * * * * * * * * * * * * * * * */

  $scope.$on("$destroy", function () {
    socket.off("shows");
    socket.off("composition-"+id);
    socket.off("position");
    socket.off("player-status");
    $scope.playerStop();
  });

  socket.on('shows', function (shows) {
    console.log("received shows");
    $scope.model.shows = shows;
    $scope.model.selectedShow = $scope.model.shows[0];
  });

  socket.on('composition-'+id, function (composition) {
    console.log("received composition");
    $scope.model.composition = composition;
    console.log(composition);
  });

  socket.on("position", function (position) {
    $scope.model.pos = position;
  });

  socket.on('player-status', function (status) {
    console.log('status', status);
    $scope.model.playerStatus = status;
    if (status.compositionId) {
      $scope.model.selected = null;
    }
  });

  /* * * * * * * * * * * * * * * *
                EDIT
  * * * * * * * * * * * * * * * */

  $scope.goto = function (showIndex) {
    console.log("goto");
    $scope.model.tooltip = -1;
    var shows = $scope.showsFromComposition($scope.model.composition);
    var show = shows[showIndex];

    var defaultValue = "1";
    var title = 'Enter keyframe 1-' + (show.keyframes.length); // One indexed

    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Goto' }
    ];

    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log("resp", resp);
      if (resp.button.name == 'ok') {
        var keyframeIndex = parseInt(resp.text + "") - 1; // Zero indexed
        if (!isNaN(keyframeIndex) && keyframeIndex >= 0 && keyframeIndex < show.keyframes.length) {
          $scope.model.selected = {
            showIndex: showIndex,
            keyframeIndex: keyframeIndex
          };
          $scope.$apply();
          var pos = {};
          Object.assign(pos, show.keyframes[keyframeIndex].pos);
          var scale = $scope.model.composition.list[showIndex].scale;
          var offset = $scope.model.composition.list[showIndex].offset;
          pos.x *= scale.x; pos.x += offset.x;
          pos.y *= scale.y; pos.y += offset.y;
          pos.z *= scale.z; pos.z += offset.z;
          socket.emit("goto", pos);
        }
      }
    });
  };

  $scope.addAfter = function (index) {
    console.log("add after:", index);
    $scope.model.tooltip = -1;
    $scope.model.selected = null;
    var composition = compositionDeepCopy();
    composition.list.splice(index+1, 0, {
      show: $scope.model.selectedShow._id,
      offset: { x: 0.0, y: 0.0, z: 0.0 },
      scale: { x: 1.0, y: 1.0, z: 1.0 }
    });
    socket.emit("set-composition", composition);
  };

  $scope.upShow = function (index) {
    console.log("up:", index);
    $scope.model.tooltip -= 1;
    $scope.model.selected = null;
    var composition = compositionDeepCopy();
    composition.list.splice(index-1, 0, composition.list[index]);
    composition.list.splice(index+1, 1);
    socket.emit("set-composition", composition);
  };

  $scope.downShow = function (index) {
    console.log("down:", index);
    $scope.model.tooltip += 1;
    $scope.model.selected = null;
    var composition = compositionDeepCopy();
    composition.list.splice(index+2, 0, composition.list[index]);
    composition.list.splice(index, 1);
    socket.emit("set-composition", composition);
  };

  $scope.deleteShow = function (index) {
    console.log("delete:", index);
    $scope.model.tooltip = -1;
    $scope.model.selected = null;
    var composition = compositionDeepCopy();
    composition.list.splice(index, 1);
    socket.emit("set-composition", composition);
  };

  $scope.editOffset = function (index) {
    console.log("edit offset:", index);
    $scope.model.tooltip = -1;
    $scope.model.selected = null;

    var composition = compositionDeepCopy();

    var offset = composition.list[index].offset;
    var defaultValue = (offset.x.toFixed(2) + " " +
                        offset.y.toFixed(2) + " " +
                        offset.z.toFixed(2));

    var title = 'Enter offset for #'+(index+1)+' like x y z';

    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Ok' }
    ];

    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log("resp", resp)
      if (resp.button.name == 'ok') {
        var inOffset = (resp.text + "").split(" ").map(function (num) { return parseFloat(num) });
        if (inOffset.length == 3 && !isNaN(inOffset[0]) && !isNaN(inOffset[1]) && !isNaN(inOffset[2])) {
          offset.x = inOffset[0];
          offset.y = inOffset[1];
          offset.z = inOffset[2];
          socket.emit("set-composition", composition);
        }
      }
    });
  };

  $scope.editScale = function (index) {
    console.log("edit scale:", index);
    $scope.model.tooltip = -1;
    $scope.model.selected = null;

    var composition = compositionDeepCopy();

    var scale = composition.list[index].scale;
    var defaultValue = (scale.x.toFixed(2) + " " +
                        scale.y.toFixed(2) + " " +
                        scale.z.toFixed(2));

    var title = 'Enter scale for #'+(index+1)+' like x y z';

    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Ok' }
    ];

    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log("resp", resp)
      if (resp.button.name == 'ok') {
        var inScale = (resp.text + "").split(" ").map(function (num) { return parseFloat(num) });
        if (inScale.length == 3 && !isNaN(inScale[0]) && !isNaN(inScale[1]) && !isNaN(inScale[2])) {
          scale.x = inScale[0];
          scale.y = inScale[1];
          scale.z = inScale[2];
          socket.emit("set-composition", composition);
        }
      }
    });
  };

  /* * * * * * * * * * * * * * * *
              PLAYER
  * * * * * * * * * * * * * * * */

  $scope.playerStart = function () {
    // Sanity check
    if (!$scope.model.selected) return;

    console.log("play!");

    var composition = compositionDeepCopy();
    composition.list.forEach(function (item) {
      item.show = $scope.model.shows.filter(function (show) {
        return show._id == item.show;
      })[0];
    });

    socket.emit("player-start", {
      start: {
        showIndex: $scope.model.selected.showIndex,
        keyframeIndex: $scope.model.selected.keyframeIndex
      },
      composition: composition
    });

    $scope.model.selected = null;
  };

  $scope.playerStop = function () {
    socket.emit("player-stop");
  };

  $scope.stop = function () {
    socket.emit("stop");
  };

  /* * * * * * * * * * * * * * * *
              INIT
  * * * * * * * * * * * * * * * */

  socket.emit('edit-composition', id);

});

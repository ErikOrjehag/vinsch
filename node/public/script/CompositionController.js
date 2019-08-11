
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
    // TODO
    socket.off("show-"+id);
    socket.off("current-"+id);
    socket.off("playing-"+id);
    socket.off("position");
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
          socket.emit("goto", show.keyframes[keyframeIndex].pos);
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

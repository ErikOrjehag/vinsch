
app.controller('CompositionsController', function ($scope, socket) {

  $scope.model = {
    compositions: [],
    tooltip: -1
  };

  /* * * * * * * * * * * * * * * *
              SOCKET
  * * * * * * * * * * * * * * * */
  $scope.$on("$destroy", function () {
    socket.off("shows");
  });

  socket.on("compositions", function (compositions) {
    console.log(compositions);
    $scope.model.compositions = compositions;
  });

  socket.emit('get-compositions');

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

  $scope.createComposition = function () {
    var title = 'Please enter name:';
    var defaultValue = 'My composition';
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Create' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp);
      if (resp.button.name === "ok" && resp.text !== "") {
          socket.emit("create-composition", resp.text);
      }
    });
  };

  $scope.getCompositionName = function (id) {
    return $scope.model.compositions.filter(function (composition) { return composition._id == id })[0].name;
  }

  $scope.deleteComposition = function (id) {
    $scope.model.tooltip = -1;
    var name = $scope.getCompositionName(id);
    var title = 'Are you sure you want to DELETE this composition?\nType \"'+name+'\" to proceed:';
    var defaultValue = "";
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Delete' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp, name);
      if (resp.button.name === "ok" && resp.text === name) {
          socket.emit("delete-composition", id);
      }
    });
  };

  $scope.makeDefaultComposition = function (id) {
    $scope.model.tooltip = -1;
    socket.emit("make-default-composition", id);
  };

});

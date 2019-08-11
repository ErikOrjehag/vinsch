
app.controller('ShowsController', function ($scope, socket) {

  $scope.model = {
    shows: [],
    tooltip: -1
  };

  /* * * * * * * * * * * * * * * *
              SOCKET
  * * * * * * * * * * * * * * * */

  $scope.$on("$destroy", function () {
    socket.off("shows");
  });

  socket.on("shows", function (shows) {
    console.log(shows);
    $scope.model.shows = shows;
  });

  socket.emit('get-shows');

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

  $scope.downloadShow = function (id) {
    window.open('/download/'+id);
  };

  $scope.createShow = function () {
    var title = 'Please enter name:';
    var defaultValue = 'My show';
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Create' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp);
      if (resp.button.name === "ok" && resp.text !== "") {
          socket.emit("create-show", resp.text);
      }
    });
  };

  $scope.getShowName = function (id) {
    return $scope.model.shows.filter(function (show) { return show._id == id })[0].name;
  }

  $scope.deleteShow = function (id) {
    $scope.model.tooltip = -1;
    var name = $scope.getShowName(id);
    var title = 'Are you sure you want to DELETE this show?\nType \"'+name+'\" to proceed:';
    var defaultValue = "";
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Delete' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp, name);
      if (resp.button.name === "ok" && resp.text === name) {
          socket.emit("delete-show", id);
      }
    });
  };

  $scope.copyShow = function (id) {
    $scope.model.tooltip = -1;
    var title = 'Please enter name for copy:';
    var defaultValue = '';
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Copy' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp);
      if (resp.button.name === 'ok' && resp.text !== "") {
          socket.emit("copy-show", { id: id, name: resp.text });
      }
    });
  };

  $scope.renameShow = function (id) {
    $scope.model.tooltip = -1;
    var title = 'Please enter new name:';
    var defaultValue = $scope.getShowName(id);
    var buttons = [
      { name: 'cancel', text: 'Cancel' },
      { name: 'ok', text: 'Rename' },
    ];
    $.fn.prompt(title, defaultValue, buttons, function (resp) {
      console.log(resp);
      if (resp.button.name === 'ok' && resp.text !== "") {
          socket.emit("rename-show", { id: id, name: resp.text });
      }
    });
  };
});

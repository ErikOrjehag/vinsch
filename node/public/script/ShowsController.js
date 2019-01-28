
app.controller('ShowsController', function ($scope, socket) {

  $scope.model = {
    shows: [],
    tooltip: -1
  };

  socket.emit('get-shows');

  socket.on("shows", function (shows) {
    console.log(shows);
    $scope.model.shows = shows;
  });

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
    $('<p>Please enter name:</p>').prompt(function (e) {
      console.log(e.response);
      if (e.response && e.response !== true && e.response !== "") {
          socket.emit("create-show", e.response);
      } else if (e.response !== false) {
        e.preventDefault();
      }
    });
  };

  $scope.deleteShow = function (id) {
    $scope.model.tooltip = -1;
    var name = $scope.model.shows.filter(function (show) { return show._id == id })[0].name;
    $('<p>Are you sure you want to DELETE this show?\nType \"'+name+'\" to proceed:</p>').prompt(function (e) {
      console.log(e.response, name);
      if (e.response === name) {
          socket.emit("delete-show", id);
      } else if (e.response !== false) {
        e.preventDefault();
      }
    });
  };

  $scope.copyShow = function (id) {
    $scope.model.tooltip = -1;
    $('<p>Please enter name for copy:</p>').prompt(function (e) {
      console.log(e.response);
      if (e.response && e.response !== true && e.response !== "") {
          socket.emit("copy-show", { id: id, name: e.response });
      } else if (e.response !== false) {
        e.preventDefault();
      }
    });
  };

  $scope.makeDefaultShow = function (id) {
    $scope.model.tooltip = -1;
    socket.emit("make-default-show", id);
  };

  $scope.renameShow = function (id) {
    $scope.model.tooltip = -1;
    $('<p>Please enter new name:</p>').prompt(function (e) {
      console.log(e.response);
      if (e.response && e.response !== true && e.response !== "") {
          socket.emit("rename-show", { id: id, name: e.response });
      } else if (e.response !== false) {
        e.preventDefault();
      }
    });
  };
});

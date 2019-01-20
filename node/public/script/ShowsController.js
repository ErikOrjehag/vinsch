
app.controller('ShowsController', function ($scope, socket) {

  $scope.model = {
    shows: []
  };

  socket.emit('get-shows');

  socket.on("shows", function (shows) {
    console.log(shows);
    $scope.model.shows = shows;
  });

  $scope.createShow = function () {
    var input = window.prompt('Please enter new show name:');
    if (input != "") {
      socket.emit("create-show", input);
    } else {
      alert("Incorrect!");
    }
  };

  $scope.deleteShow = function (id) {
    var name = $scope.model.shows.filter(function (show) { return show._id == id })[0].name;
    var input = window.prompt('Are you sure you want to DELETE this show?\nType "'+name+'" to proceed:');
    if (input == name) {
      socket.emit("delete-show", id);
    } else {
      alert("Incorrect!");
    }
  };

  $scope.copyShow = function (id) {
    var name = $scope.model.shows.filter(function (show) { return show._id == id })[0].name;
    var input = window.prompt('Please enter new show name:', 'Copy of: ' + name);
    if (input != "") {
      socket.emit("copy-show", { id: id, name: input });
    } else {
      alert("Incorrect!");
    }
  };

  $scope.makeDefaultShow = function (id) {
    socket.emit("make-default-show", id);
  };

  $scope.renameShow = function (id) {
    var name = $scope.model.shows.filter(function (show) { return show._id == id })[0].name;
    var input = window.prompt('Please enter new show name:', name);
    if (input != "") {
      socket.emit("rename-show", { id: id, name: input });
    } else {
      alert("Incorrect!");
    }
  };
});

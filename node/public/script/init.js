
var app = angular.module('app', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'view/home.html'
  })
  .when('/play', {
    templateUrl: 'view/play.html',
    controller: 'PlayController',
  })
  .when('/edit', {
    templateUrl: 'view/edit.html',
    controller: 'EditController',
  })
  .when('/calibrate', {
    templateUrl: 'view/calibrate.html',
    controller: 'CalibrateController',
  });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
})

.controller('PlayController', function ($scope) {

})

.controller('EditController', function ($scope) {

})


var app = angular.module('app', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'view/home.html'
  })
  .when('/shows', {
    templateUrl: 'view/shows.html',
    controller: 'ShowsController',
  })
  .when('/show/:id', {
    templateUrl: 'view/show.html',
    controller: 'ShowController',
  })
  .when('/calibrate', {
    templateUrl: 'view/calibrate.html',
    controller: 'CalibrateController',
  });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
})


.controller('ShowsController', function ($scope) {

})

.controller('ShowController', function ($scope) {

})


app.directive('suchHref', ['$location', function ($location) {
  return{
    restrict: 'A',
    link: function (scope, element, attr) {
      element.attr('style', 'cursor:pointer');
      element.on('click', function(){
        $location.path(attr.suchHref)
        scope.$apply();
      });
    }
  }
}]);

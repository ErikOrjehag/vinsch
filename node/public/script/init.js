
var app = angular.module('app', ['ngRoute', 'ngSanitize']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'view/home.html'
  })
  .when('/compositions', {
    templateUrl: 'view/compositions.html',
    controller: 'CompositionsController',
  })
  .when('/composition/:id', {
    templateUrl: 'view/composition.html',
    controller: 'CompositionController',
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
  })
  .when('/manual', {
    templateUrl: 'view/manual.html',
    controller: 'ManualController',
  })
  .when('/layout', {
    templateUrl: 'view/layout.html',
    controller: 'LayoutController',
  })

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
});

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

app.filter('coordinate', function() {
  return function (input) {
    var out = "";
    ["x", "y", "z"].forEach(function (dim) {
      out += (input[dim] >= 0 ? "&nbsp;" : "") + input[dim].toFixed(2) + "&nbsp;";
    });
    return out.slice(0, -1);
  };
})

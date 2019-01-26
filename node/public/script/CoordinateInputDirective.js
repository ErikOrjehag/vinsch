
app.directive('coordinateInput', function () {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      coordinate: "=",
      label: "@"
    },
    template: ''+
    '<div class="field">'+
      '<label class="label" ng-bind="label"></label>'+
      '<div class="field has-addons">'+
        '<div class="control">'+
          '<input class="input" type="number" placeholder="x" ng-model="coordinate.x" required=""/>'+
        '</div>'+
        '<div class="control">'+
          '<input class="input" type="number" placeholder="y" ng-model="coordinate.y" required=""/>'+
        '</div>'+
        '<div class="control">'+
          '<input class="input" type="number" placeholder="z" ng-model="coordinate.z" required=""/>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '',
    link: function (scope, element, attr) {

    }
  }
});

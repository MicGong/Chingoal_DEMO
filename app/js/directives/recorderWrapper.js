app.directive('recorderWrapper', function(){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope, $element, $attrs, $transclude) {
            this.userAudioBuffer = null;
            this.userAudioBlob = null;
        },
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        // link: function($scope, element, attrs) {}
    };
});
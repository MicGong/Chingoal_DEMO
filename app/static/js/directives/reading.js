app.directive('reading', function(){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.ind = 0;
            $scope.word = {
                "word" : "中文",
                "translations" : {
                    "A" : "Chinese",
                    "B" : "English",
                    "C" : "Spanish"
                },
                "answer" : "A",
                "img" : "static/img/chinese.png"
            };

        },
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'templates/readingTemplate.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs, controller) {
            $scope.prevBtnClicked = function() {
                if ($scope.ind > 0) {
                    $scope.ind--;
                }
            };
            $scope.nextBtnClicked = function() {
                if ($scope.ind < $scope.words.length-1) {
                    $scope.ind++;
                }
            };
            var checkBtn = element.find('i');
            checkBtn.bind('click', function(e) {
                checkBtn.removeClass('fa-question-circle');
                checkBtn.toggleClass('text-success', $('#firstChoice')[0].checked);
                checkBtn.toggleClass('text-danger', !$('#firstChoice')[0].checked);
                checkBtn.toggleClass('fa-check-circle-o', $('#firstChoice')[0].checked);
                checkBtn.toggleClass('fa-times-circle-o', !$('#firstChoice')[0].checked);
            });
        }
    };
});
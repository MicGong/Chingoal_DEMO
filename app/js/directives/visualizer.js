app.directive('visualizer', ['$http', function($http){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            audioUrl: '='
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        require: '^?recorderWrapper', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'templates/visualizerTemplate.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs) {
            var canvas = element.find('canvas')[0];
            var audioContext = window.AudioContext || window.webkitAudioContext;
            var audioContextInstance = new audioContext();
            var drawBuffer = function(width, height, context, data) {
                var step = Math.ceil( data.length / width );
                var amp = height / 2;
                context.fillStyle = "#fed136";
                context.clearRect(0,0,width,height);
                for(var i=0; i < width; i++){
                    var min = 1.0;
                    var max = -1.0;
                    for (j=0; j<step; j++) {
                        var datum = data[(i*step)+j]; 
                        if (datum < min)
                            min = datum;
                        if (datum > max)
                            max = datum;
                    }
                    context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
                }
            }
            var audio = new Audio();
            audio.src = $scope.audioUrl;
            $http.get($scope.audioUrl, { responseType : 'arraybuffer' })
                .then(function successCallBack(response){
                        audioContextInstance.decodeAudioData(response.data, function(buffer) {
                            drawBuffer(canvas.width, canvas.height, 
                                canvas.getContext('2d'), buffer.getChannelData(0));
                        });
                    }, 
                    function errorCallBack(response){
                        console.log(response);
                        console.log("Error getting visualizer audio...");
                    });
            var playBtn = element.find('i');
            var playing = false;
            playBtn.bind('click', function(){
                playBtn.toggleClass('fa-pause');
                playBtn.toggleClass('fa-play');
                playBtn.toggleClass('fa-play');
                if (!playing) {
                    audio.play();
                    playing = true;
                } else {
                    audio.pause();
                    playing = false;
                }
            });
            $(audio).on('ended', function() {
                playing = false;
                playBtn.removeClass('fa-pause');
                playBtn.addClass('fa-play');
            });
            
        }
    };
}]);
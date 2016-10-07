app.directive('recorder', function(){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        require: '^recorderWrapper', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'templates/recorderTemplate.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, element, attrs, controllerInstance) {
            $scope.recording = false; 

            var recorder = null;
            var recordingLength = 0;
            var leftchannel = [];
            var rightchannel = [];
            var sampleRate = null;

            var context = null;
            var gainNode = null;
            var audioInputNode = null;
            var analyserNode = null;

            var audioContext = window.AudioContext || window.webkitAudioContext;
            var context = new AudioContext();
            
            var canvasHeight = 0, canvasWidth = 0;
            var visualizerContext = null;

            var blob = null;

            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.getUserMedia || 
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia || 
                    navigator.msGetUserMedia;

            navigator.getUserMedia(
                { audio: true },
                success,
                function(e) { alert('Error capturing audio.'); }
            );

            function success(e) {
                sampleRate = context.sampleRate;

                // console.log('succcess');
                
                // creates a gain node
                gainNode = context.createGain();

                analyserNode = context.createAnalyser();
                analyserNode.fftSize = 2048;
                gainNode.connect(analyserNode);

                // creates an audio node from the microphone incoming stream
                audioInputNode = context.createMediaStreamSource(e);

                // connect the stream to the gain node
                audioInputNode.connect(gainNode);

                // on audio process
                var bufferSize = 2048;
                recorder = context.createScriptProcessor(bufferSize, 2, 2);

                recorder.onaudioprocess = function(e){
                    if (!$scope.recording) return;
                    var left = e.inputBuffer.getChannelData (0);
                    var right = e.inputBuffer.getChannelData (1);
                    // we clone the samples
                    leftchannel.push (new Float32Array (left));
                    rightchannel.push (new Float32Array (right));
                    recordingLength += bufferSize;
                    console.log('recording');
                }

                // we connect the recorder
                gainNode.connect (recorder);
                recorder.connect (context.destination); 

                // update visualizer
                updateVisualizer();
            }

            function updateVisualizer() {

                if (!visualizerContext) {
                    var visualizerCanvas = element.find('canvas')[0];
                    canvasHeight = visualizerCanvas.height;
                    canvasWidth = visualizerCanvas.width;
                    visualizerContext = visualizerCanvas.getContext('2d');
                }

                var SPACING = 3;
                var BAR_WIDTH = 1;
                var numBars = Math.round(canvasWidth / SPACING);
                var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

                analyserNode.getByteFrequencyData(freqByteData); 

                visualizerContext.clearRect(0, 0, canvasWidth, canvasHeight);
                visualizerContext.fillStyle = '#F6D565';
                visualizerContext.lineCap = 'round';
                var multiplier = analyserNode.frequencyBinCount / numBars;
                // Draw rectangle for each frequency bin.
                for (var i = 0; i < numBars; ++i) {
                    var magnitude = 0;
                    var offset = Math.floor( i * multiplier );
                    // gotta sum/average the block, or we miss narrow-bandwidth spikes
                    for (var j = 0; j< multiplier; j++)
                        magnitude += freqByteData[offset + j];
                    magnitude = magnitude / multiplier / 2;
                    // magnitude = magnitude / multiplier;
                    var magnitude2 = freqByteData[i * multiplier];
                    visualizerContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
                    visualizerContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
                }

                window.requestAnimationFrame(updateVisualizer);
            }
            
            $scope.initRecording = function() {
                $scope.recording = true;
                leftchannel = [];
                rightchannel = [];
                recordingLength = 0;
            }

            $scope.finishRecording = function() {
                // set recoding flag
                recoding = false;
                
                // merge buffers
                var leftBuffer = mergeBuffers ( leftchannel, recordingLength );
                var rightBuffer = mergeBuffers ( rightchannel, recordingLength );
                // interleave channels
                var interleaved = interleave(leftBuffer, rightBuffer);

                // we create our wav file
                var buffer = new ArrayBuffer(44 + interleaved.length * 2);
                var view = new DataView(buffer);        
                // RIFF chunk descriptor
                writeUTFBytes(view, 0, 'RIFF');
                view.setUint32(4, 44 + interleaved.length * 2, true);
                writeUTFBytes(view, 8, 'WAVE');
                // FMT sub-chunk
                writeUTFBytes(view, 12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                // stereo (2 channels)
                view.setUint16(22, 2, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * 4, true);
                view.setUint16(32, 4, true);
                view.setUint16(34, 16, true);
                // data sub-chunk
                writeUTFBytes(view, 36, 'data');
                view.setUint32(40, interleaved.length * 2, true);        
                // write the PCM samples
                var lng = interleaved.length;
                var index = 44;
                var gainNode = 1;
                for (var i = 0; i < lng; i++){
                    view.setInt16(index, interleaved[i] * (0x7FFF * gainNode), true);
                    index += 2;
                }        
                // our final binary blob
                blob = new Blob ( [ view ], { type : 'audio/wav' } );        
                $scope.$apply(function(){
                    console.log('finished recording');
                    controllerInstance.userAudioBuffer = leftBuffer;
                    controllerInstance.userAudioBlob = blob;
                });
                // $scope.userBlob = blob;
            }

            function mergeBuffers(channelBuffer, recordingLength){
                var result = new Float32Array(recordingLength);
                var offset = 0;
                var lng = channelBuffer.length;
                for (var i = 0; i < lng; i++){
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }
                return result;
            }

            function interleave(leftChannel, rightChannel){
                var length = leftChannel.length + rightChannel.length;
                var result = new Float32Array(length);
                
                var inputIndex = 0;
                
                for (var index = 0; index < length; ){
                    result[index++] = leftChannel[inputIndex];
                    result[index++] = rightChannel[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            function writeUTFBytes(view, offset, string){ 
                var lng = string.length;
                for (var i = 0; i < lng; i++){
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            var recordBtn = element.find('i');
            recordBtn.bind('click', function(e) {
                recordBtn.toggleClass('fa-pause');
                recordBtn.toggleClass('fa-microphone');
                if (!$scope.recording) {
                    $scope.recording = true;
                    $scope.initRecording();
                } else {
                    $scope.recording = false;
                    $scope.finishRecording();
                }
            });
        }
    }
});
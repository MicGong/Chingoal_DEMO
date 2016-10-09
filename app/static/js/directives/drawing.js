app.directive('drawing', function(){
    // Runs during compile
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var canvas = element[0];
            var actulHeight = canvas.height, 
                actulWidth = canvas.width, 
                clientHeight = canvas.clientHeight,
                clientWidth = canvas.clientWidth;
            var ctx = canvas.getContext('2d');
            var ratioH = actulHeight / clientHeight, ratioW = actulWidth / clientWidth;

            ctx.scale(ratioW, ratioH);

            var mobileoffsetX = 100;
            var mobileoffsetY = 30;

            var drawing = false;
            var lastX, lastY;

            var start  = 'mousedown',
                move   = 'mousemove',
                end    = 'mouseup';

            // if (Modernizr.touch === true) {
            //     start  = 'touchstart';
            //     move   = 'touchmove';
            //     end    = 'touchend';
            // }

            element.bind(start, function(event){
                if(start == 'touchstart') {
                    event.preventDefault();
                }

                if(event.offsetX!==undefined){
                    lastX = event.offsetX;
                    lastY = event.offsetY;
                } else if(event.pageX!==undefined) {
                    // Firefox compatibility
                    lastX = event.pageX - event.currentTarget.offsetLeft;
                    lastY = event.pageY - event.currentTarget.offsetTop;
                } else {
                    // Mobile compatibility
                    lastX = event.originalEvent.targetTouches[0].pageX - mobileoffsetX;
                    lastY = event.originalEvent.targetTouches[0].pageY - mobileoffsetY;
                }

                drawing = true;

            });


            element.bind(move, function(event){
                if(move == 'touchmove') {
                    event.preventDefault();
                }

                if(drawing){
                    if(event.offsetX!==undefined){
                        currentX = event.offsetX;
                        currentY = event.offsetY;
                    } else if(event.pageX!==undefined) {
                        currentX = event.pageX - event.currentTarget.offsetLeft;
                        currentY = event.pageY - event.currentTarget.offsetTop;
                    } else {
                        currentX = event.originalEvent.targetTouches[0].pageX - mobileoffsetX;
                        currentY = event.originalEvent.targetTouches[0].pageY - mobileoffsetY;
                    }

                    if ($scope.mode) {
                        draw(lastX, lastY, currentX, currentY);
                    } else {
                        erase(lastX, lastY);
                    }

                    lastX = currentX;
                    lastY = currentY;
                }
            });

            element.bind(end, function(event){
                drawing = false;
            });

            function draw(lX, lY, cX, cY){
                ctx.beginPath();
                ctx.globalCompositeOperation = 'source-over';
                ctx.moveTo(lX,lY);
                ctx.lineTo(cX,cY);
                ctx.lineWidth = 15;
                ctx.strokeStyle = '#000000';
                ctx.stroke();
                ctx.closePath();
            }

            function erase(lX, lY) {
                ctx.beginPath();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.arc(lX, lY, 8, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.closePath();
            }
        }
    };
});
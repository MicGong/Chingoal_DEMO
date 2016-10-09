app.controller('drawingController', function($scope){
    $scope.mode = true;
    $scope.ind = 0;
    $scope.images = [
        {
            'url': '../../static/img/writing-word1-sml.png',
            'word':'我'
        },
        {
            'url': '../../static/img/writing-word2-sml.png',
            'word':'要'
        },
        {
            'url': '../../static/img/writing-word3-sml.png',
            'word':'学'
        },
        {
            'url': '../../static/img/writing-word4-sml.png',
            'word':'中'
        },
        {
            'url': '../../static/img/writing-word5-sml.png',
            'word':'文'
        }
    ];

    $scope.getImageNumber = function(){
        return new Array($scope.images.length);
    };

    $scope.userDrawings = new Array($scope.images.length).fill(
        $('<canvas/>').addClass('result-canvas')[0]
    );

    $scope.toggleMode = function() {
        $scope.mode = !$scope.mode;
    };

    $scope.resetClicked = function() {
        var w = $('#draw-board').width(), h = $('#draw-board').height();
        var canv = $('#draw-board')[0];
        canv.getContext('2d').clearRect(0,0,w,h);
    };

    $scope.saveClicked = function() {
        $scope.saveImage();
    }

    $scope.prevClicked = function() {
        $scope.saveImage();
        $scope.resetClicked();
        if ($scope.ind > 0)
            $scope.ind--;
        $scope.updateCanvasBG();
    };

    $scope.nextClicked = function() {
        $scope.saveImage();
        $scope.resetClicked();
        if ($scope.ind < $scope.images.length-1)
            $scope.ind++;
        $scope.updateCanvasBG();
    };

    $scope.updateCanvasBG = function() {
        var imgNamePre = 'static/img/writing-word';
        var imgNameSuf = '-sml.png';
        var imgNameURL = 'url(' + imgNamePre + ($scope.ind+1) + imgNameSuf + ')';
        $('#draw-board').css('background', imgNameURL);
    };

    $scope.saveImage = function() {
        var selector = '.result-canvas-container:nth-child(' + ($scope.ind+1) + ') > canvas';
        var canvas = $(selector)[0];
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        $('#draw-board')[0].toBlob(function(blob){
            var url = URL.createObjectURL(blob);
            var newImg = new Image();
            $(newImg).load(function(){
                var ctx = canvas.getContext('2d');
                ctx.drawImage(newImg, 0, 0, canvas.width, canvas.height);
            });
            newImg.src = url;
        });
    };

})
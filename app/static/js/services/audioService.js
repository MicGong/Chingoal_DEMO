app.factory('audioService', ['$http', function($http){
    return $http.get('https://s3.amazonaws.com/chingoaldemo/audio/Imagine+Dragons+-+I+Bet+My+Life.mp3', 
            { responseType : 'arraybuffer' })
        .success(function(data) { return data; })
        .error(function(e) { return e; });
}])
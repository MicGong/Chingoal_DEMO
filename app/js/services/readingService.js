app.factory('readingService', ['$http', function($http){
    return $http.get('https://s3.amazonaws.com/chingoaldemo/words/writing-tests.json')
        .success(function(data) { return data; })
        .error(function(e) { return e; });
}])
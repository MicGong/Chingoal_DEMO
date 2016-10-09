var angularserver = require('angularjs-server');
var path = require('path');
var express = require('express');
var fs = require('fs');

var projectDir = path.join(__dirname, 'app/');
var templateFile = path.join(projectDir, 'index.html');
var template = fs.readFileSync(templateFile, {encoding:'utf8'});
var staticDir = path.join(projectDir, 'static/');

var app = express();
var angularMiddlewares = angularserver.Server(
    {
        template: template,
        serverScripts: [
	    path.join(staticDir, 'js/vendor/jquery.js'),
            path.join(staticDir, 'js/vendor/bootstrap.min.js'),
	    path.join(staticDir, 'js/vendor/angular.min.js'),
	    path.join(staticDir, 'js/app.js'),
	    path.join(staticDir, 'js/vendor/theme.custom.js'),
	    path.join(staticDir, 'js/controllers/drawingController.js')
        ],
        clientScripts: [
	    path.join(staticDir, 'js/vendor/jquery.js'),
            path.join(staticDir, 'js/vendor/bootstrap.min.js'),
	    path.join(staticDir, 'js/vendor/angular.min.js'),
	    path.join(staticDir, 'js/app.js'),
            path.join(staticDir, 'js/vendor/theme.custom.js')
        ],
        angularModules: [
            'ChingoalDemo'
        ]
    }
);

app.use('/:static', express.static(staticDir));
app.use(angularMiddlewares.htmlGenerator);

app.listen(3000);
console.log('Server started, listening on port 3000');

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here

var runServer = function(callback) {
    var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
    mongoose.connect(databaseUri).then(function() {
        var server = app.listen(8080, function() {
            console.log('Listening on localhost:8080');
            callback(server);
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;


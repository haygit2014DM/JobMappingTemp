// Setup server and RESTful API
//
// @todo we need a way to globally manage development vs. production
// @todo for loops are being duplicated, need to refactor for DRY
//

// Module dependencies.
//
// @todo We're using global scope here, perhaps we should name space or stick in
//      self-invoking anonymous function.
//
var express = require('express'),
    app = express(),
    http = require('http'),
    path = require('path');

// Configure Development Server Settings
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/hgApps'));
    //app.use(express.static(__dirname + '/public'));
});

// Start the server
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

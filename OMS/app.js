
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var dbCollection = "mongodb://localhost/OMS"

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.configure('development', function () { app.locals.pretty = true; });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/research', routes.research);
app.get('/oms', routes.oms);

var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function (socket) {
    
    console.log('a user connected');
    
    var gridInterval = setInterval(function () { refreshGrid(); }, 30000);
    
    function refreshGrid(){
        mongo.connect(dbCollection, function (err, db) {
            if (err) {
                console.warn(err.message);
            } else {
                var symbols = db.collection('grid')
                var stream = symbols.find().sort('{symbol: 1}').stream();
                stream.on('data', function (grid) { console.log('refresh emitting symbol: ' + grid.symbol); socket.emit('gridSend', grid.symbol); });
            }
        });
    }
       
    socket.on('disconnect', function () {
        console.log('user disconnected');
        clearInterval(gridInterval);
    });
    
    socket.on('refreshGrid', function (msg) {
        refreshGrid();
    });
    
    socket.on('gridAdd', function (msg) {
        
        mongo.connect(dbCollection, function (err, db) {
            if (err) {
                console.warn(err.message);
            } else {
                var collection = db.collection('grid');
                collection.insert({ symbol: msg }, function (err, o) {
                    if (err) { console.warn(err.message); }
                    else { console.log("Symbol inserted into db: " + msg); }
                });
            }
            socket.broadcast.emit('grid', msg);
        });
    });
    
    socket.on('gridRemove', function (msg) {
        
        mongo.connect(dbCollection, function (err, db) {
            if (err) {
                console.warn(err.message);
            } else {
                var collection = db.collection('grid');
                collection.remove({ symbol: msg }, function (err, o) {
                    if (err) { console.warn(err.message); }
                    else { console.log("Symbol removed from db: " + msg); }
                });
            }
            socket.broadcast.emit('grid', msg);
        });
    });

    socket.on('trade', function (msg) {
        
        mongo.connect(dbCollection, function (err, db) {
            if (err) {
                console.warn(err.message);
            } else {
                var trades = db.collection('trades');
                trades.insert({ content: msg }, function (err, o) {
                    if (err) { console.warn(err.message); }
                    else { console.log("Trade inserted into db: " + msg); }
                });
            }
            socket.broadcast.emit('trade', msg);
        });
    });
});

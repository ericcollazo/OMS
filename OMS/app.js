
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
    
    mongo.connect(dbCollection, function (err, db) {
        if (err) {
            console.warn(err.message);
        } else {
            var trades = db.collection('trades')
            var stream = trades.find().sort().stream();
            stream.on('data', function (trade) { console.log('emitting trade'); socket.emit('trade', trade.content); });
            
            var symbols = db.collection('grid')
            var stream = symbols.find().sort().stream();
            stream.on('data', function (symbol) { console.log('emitting symbol'); socket.emit('symbol', symbol.content); });
        }
    });
    
    socket.on('disconnect', function () {
        console.log('user disconnected');
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
        });
        
        socket.broadcast.emit('trade', msg);
    });

    socket.on('grid', function (msg) {
        
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
        });
        
        socket.broadcast.emit('grid', msg);
    });
});

/**
 * HOW TO Make an HTTP Call - GET
 */
// options for GET

//var https = require('http');

//var optionsget = {
//    host : 'http://dev.markitondemand.com/MODApis/Api/v2/Quote', // here only the domain name
//    // (no http/https !)
//    path : '/jsonp?symbol=AAPL', // the rest of the url with parameters if needed
//    method : 'GET' // do GET
//};

//console.info('Options prepared:');
//console.info(optionsget);
//console.info('Do the GET call');

//// do the GET request
//var reqGet = https.request(optionsget, function (res) {
//    console.log("statusCode: ", res.statusCode);
//    // uncomment it for header details
//    //  console.log("headers: ", res.headers);
    
    
//    res.on('data', function (d) {
//        console.info('GET result:\n');
//        process.stdout.write(d);
//        console.info('\n\nCall completed');
//    });
 
//});

//reqGet.end();
//reqGet.on('error', function (e) {
//    console.error(e);
//});

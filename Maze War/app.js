var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mazeGen = require(path.join(__dirname, 'public/javascripts/maze_generator.js'));

var app = express();


let args = process.argv;
console.log(args);
let playerMax = args.length > 2 ? args[2] : 4;
app.use('/playerMax.json', function(request, response) {
    console.log("Player max is " + playerMax);
    response.json(playerMax);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

var ipAddress = require('node-local-ip-address')();
app.use('/ip.json', function(request, response) {
    console.log("IP is " + ipAddress);
    response.json(ipAddress);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
  Web socket stuff....

  Messages from clients look like

  {
    "command": "login" | "forward" | "turn" | "shoot"
    "name": STRING   // Used for login
  }

var myClients = [];
var id = 1000;
const WebSocket = require('ws');
const webSocketServer = new WebSocket.Server({port:8080});

webSocketServer.on('connection', function(client) {
   client.on('open', function() {
     console.log("Client connected");
   }

   client.on('message', function(msg) {
     if (msg.command == "login") {
       myClients.push( { "name", message.name, "client": client, "id": id++ });
       client.send({ maze: maze, x: x, y: y: direction: direction });
     }

   });

   client.on('close', function() {
      // Figure out how to remove this client from the myClients list.
   });

});

webSocketServer.listen(8080, function() { console.log("Listening on local port"); }
function broadcast(msg) {
  myClients.forEach(clientObject) {
    clientObject.client.send(msg);
  }
}
 */

module.exports = app;

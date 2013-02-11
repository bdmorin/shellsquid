// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var config = require('configure');
var mongoose = require('mongoose');
var socketIO = require('socket.io');
var scanner = require('portscanner');
var sanitize = require('validator').sanitize;
var initdb = require('./lib/initdb');
var shellcode = require('./routes/api/shellcode');
var targetApi = require('./routes/api/target');
var proxy = require('./lib/proxy');
var Target = require('./models/target');
var mongoURL = process.env.MONGO_URL || 'mongodb://localhost/shellsquid';

mongoose.connect(mongoURL);
initdb();

// read https certificate
options = {
 key: fs.readFileSync(config.ssl.key),
 cert: fs.readFileSync(config.ssl.cert)
};

// express configuration
//
var app = express();
app.configure(function(){
  app.use(express.favicon());
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(err, req, res, next) {
    console.log(err);
    next();
  });
});

//
// Routes
//
app.get('/dl/:id', shellcode.download, emitShellcode, emitTargetsUpdate);
app.get('/target/:id', targetApi.single);
app.get('/targets', targetApi.all);
app.put('/target/:id', targetApi.update);
app.post('/target', targetApi.createTarget, emitTargetsUpdate);
app.del('/target/:id', targetApi.remove, emitTargetsUpdate);

//
// start the express http web api
//
var server = https.createServer(options, app);
var io = socketIO.listen(server, {log: false});
server.listen(config.webapi.port, config.webapi.ip);
console.log('Express service listening on', config.webapi.ip, 'port', config.webapi.port);


//
//  start the proxy https server
//
var proxyServer = https.createServer(options, function(req, res) {
  proxy(req, res);
  emitRequest(req);
});
proxyServer.listen(config.proxy.port, config.proxy.ip);
console.log('Proxy server listening on', config.proxy.ip, 'port', config.proxy.port)


//
// socket.io functions
//

// on connection emit to the browser the default settings
io.sockets.on('connection', function(socket) {
  var message = {
      "ip": config.default_handler.ip,
      "port": config.default_handler.port
  };
  socket.emit('defaults', message);
});

// check the status of each handler by performing a tcp port scan
setInterval(emitHandlerHealth, 1000);
function emitHandlerHealth() {
  Target.find({}, {local_host: true, local_port: true, _id: false}, function(err, targets) {
    var message = [];
    var c = 0;
    targets = unique(targets);
    targets.forEach(function(target) {
      scanner.checkPortStatus(parseInt(target.local_port), target.local_host, function(err, status) {
        c++;
        message.push({"health": status,
                          "ip": target.local_host,
                        "port": target.local_port});
        if (c === targets.length) {
          io.sockets.emit('handler:status', message);
         }
      });
    });
  });
  function unique(arr) {
    var hash = {};
    result = [];
    for(var i = 0; i < arr.length; i++) {
      if (!hash.hasOwnProperty(arr[i])) {
        hash[arr[i]] = true;
        result.push(arr[i]);
      }
    }
    return result;
  }
}

// each time there is a request to the proxy emit that request
function emitRequest(req) {
  var url = sanitize(req.headers.host + req.url).entityEncode();
  var ip = sanitize(req.connection.remoteAddress).entityEncode();
  var message =  { "ip": ip, "url": url };
  io.sockets.emit('request', message);
}

// any time shellcode is request from the api, emit that data
function emitShellcode(req, res, next) {
  var message = { "id": req.params.id };
  io.sockets.emit('shellcode', message);
  next();
}

function emitTargetsUpdate() {
  var message = {"update": "targets"};
  io.sockets.emit('update:targets', message);
}

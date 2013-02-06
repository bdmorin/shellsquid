// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var httpProxy = require('http-proxy');
var config = require('configure');
var Target = require('../../models/target');

module.exports = proxy;
function proxy(req, res) {
  var source = req.connection.remoteAddress;
  var buffer = httpProxy.buffer(req);
  var id = req.url.match('/dl/([0-9-a-f]{24})');

  // request was likely to download shellcode
  if (id) {
    return Target.findById(id[1], tryId);
  }
  return Target.findOne({ remote_ip: req.connection.remoteAddress}, tryIp);

  // try to find the remote ip in targets
  function tryIp(err, target) {
    if (err) {
       return console.log('error finding ip in collection');
    }
   if (target === null) {
      return Target.findOne({ domain_name: req.headers.host}, tryDomain);
    }
    return handleHttps(target.local_host, target.local_port);
  }

  // try to find the target by domain name specified in the host header
  function tryDomain(err, target) {
    if (err) {
      console.log('error finding domain in collection')
    }
    if (target === null) {
      pushToDefault(source);
      return handleHttps(config.default_handler.ip, config.default_handler.port);
    }
    return handleHttps(target.local_host, target.local_port);
  }

  // lookup the id, if not found go to default handler and save to default handler
  function tryId(err, target) {
    if (err) {
      handleHttps(config.webapi.ip, config.webapi.port);
    }
    else if(target) {
      target.remote_ip.addToSet(source);
      target.save(function() { return handleHttps(config.webapi.ip, config.webapi.port); });
    }
    else {
      pushToDefault(source);
      return handleHttps(config.webapi.ip, config.webapi.port);
    }
  } 

  // generic proxy function
  function handleHttps(ph, pp) {
    var proxy = new httpProxy.HttpProxy({
      target: {
               host: ph,
               port: pp,
               https: true,
               rejectUnauthorized: false
           }
    });
    proxy.proxyRequest(req, res, buffer);
  }

}

function pushToDefault(ip) {
  Target.findOne({ name: 'Default'}, function(err, target) {
    if (err) {
      console.log('error finding default collection');
    }
    if (target) {
      target.remote_ip.addToSet(ip);
      target.save(function(err) {
        if (err) {
          console.log('error saving ip to default collection');
        }
      });
    }
  });
}

// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var Target = require('../../models/target');
var config = require('configure');

// send a json object of all targets
exports.all = function(req, res) {
  Target.find(function(err,targets) {
    if (err) {
      return res.send(500, 'server error');
    }
    return res.json(200, { "targets": targets });
  });
};

// send a json object of a single target based on the ObjectID
exports.single = function(req, res) {
  var id = req.params.id;
  // verify we got a proper Id
  if (!id.match(/^[0-9-a-z-A-Z]{24}$/)) {
    return res.send(400, 'Bad Request');
  }
  Target.findById(id, function(err, target) {
    if (err) {
      return res.send(400, 'Invalid id');
    }
    if (target === null) {
      return res.send(404, 'id not found');
    }
    return res.json(200, { "target": target });
  });
};

// create a new target
exports.createTarget = function(req, res, next) {
  var target = new Target({
      name: req.body.name,
      owner: req.body.owner,
      local_host: req.body.local_host,
      local_port: req.body.local_port,
      domain_name: req.body.domain_name || '',
      shellcode: req.body.shellcode || config.default_handler.shellcode,
      requests: 0
  });
  target.save(function(err) {
    if (err) {
      if (err.message === 'Validation failed') {
        return res.send(400, 'invalid request');
      }
      else {
        return res.send(500, 'server error');
      }
    }
    res.json(201, { "target": target });
    return next();
  });
};

// perform a full update of the target
exports.update = function (req, res) {
  var id = req.params.id;
  Target.findById(id, function (err, target) {
    if (err) {
      return res.send(400, 'Invalid id');
    }
    if (target === null) {
      return res.send(404, 'id not found');
    }
    target.name = req.body.name || target.name;
    target.owner = req.body.owner || target.owner;
    target.local_host = req.body.local_host || target.local_host;
    target.local_port = req.body.local_port || target.local_port;
    target.remote_ip = req.body.remote_ip || target.remote_ip;
    target.domain_name = req.body.domain_name || target.domain_name;
    target.requests = req.body.requests || target.requests;
    target.save(function (err) {
      if (err) {
        return res.send(500, 'server error');
      }
      return res.json(200, target);
    });
  });
};

// delete a target
exports.remove = function (req, res, next) {
  var id = req.params.id;
  // verify we got a proper Id
  if (!id.match(/^[0-9-a-z-A-Z]{24}$/)) {
    return res.send(400, 'Bad Request');
  }
  Target.findById(id, function (err, target) {
    if (err) {
      return res.send(400, 'Invalid id');
    }
    if (target === null) {
      return res.send(404, 'id not found');
    }
    target.remove(function (err) {
      if (err) {
        return res.send(500, 'server error');
      }
      res.send(200);
      return next();
    });
  });
};

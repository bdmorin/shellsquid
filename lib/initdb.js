// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var conf = require('configure');
var Target = require('../models/target');

module.exports = initdb;

// sets up default handler collection
function initdb() {
  Target.findOne({name: "Default"}, function(err, target) {
    if (err) {
      return console.log(err);
    }
    if (target) {
      target.remove();
    }

    var defaultTarget = new Target({
      name: 'Default',
      owner: 'Michael Scott',
      local_host: conf.default_handler.ip,
      local_port: conf.default_handler.port,
      shellcode: conf.default_handler.shellcode,
    });
    defaultTarget.save(function(err) {
      if (err) {
        returnconsole.log(err, 'could not save default target');
      }
    });
  });
}

// Copyright (c) 2012 Tom Steele
// See the file license.txt for copying permission

var mongoose = require("mongoose");

var TargetSchema = new mongoose.Schema({
  name:        { type: String, unique: true, required: true },
  owner:       { type: String, required: true },
  local_host:  { type: String, required: true },
  local_port:  { type: Number, required: true },
  domain_name: { type: String },
  remote_ip:   [{ type: String }],
  shellcode:   { type: String },
  requests:    { type: Number}
});

var Target = mongoose.model('Target', TargetSchema);

//
// validators
//
Target.schema.path('name').validate(function(value) {
  return /^[\w\s]{1,30}$/.test(value);
}, 'invalid target name');

Target.schema.path('owner').validate(function(value) {
  return /^[\w\s]{1,30}$/.test(value);
}, 'invalid owner name');

Target.schema.path('local_host').validate(function(value) {
  return /^[\w\.0-9]+$/.test(value);
}, 'invalid local host');

Target.schema.path('local_port').validate(function(value) {
  return /^[0-9]{1,5}$/.test(value);
}, 'invalid local port');

Target.schema.path('domain_name').validate(function(value) {
  return /^[\w\.]{0,100}$/.test(value);
}, 'invalid domain name');

Target.schema.path('remote_ip').validate(function(value) {
  return /(^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$)||''/.test(value);
}, 'invalid remote ip');

Target.schema.path('shellcode').validate(function(value) {
  // i may change this later but for now lets only store alphanumeric shellcode
  return /^\w+$/.test(value);
}, 'invalid shellcode');

Target.schema.path('requests').validate(function(value) {
  return /^[0-9]+$/.test(value);
}, 'invalid requests');


module.exports = Target;

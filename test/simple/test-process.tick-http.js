// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common');
var assert = require('assert');
var net = require('net');

var common_port = common.PORT;

var first_tick = process.tick;
var server_1_listen;
var server_connection_1;
var server_connection_2;

process.on('exit', function() {
  // check general order of ticks here
  // to make sure they all fired
});

var server = net.createServer(function(c) {
  assert.equal(process.tock, first_tick);

  if (!server_connection_1) {
    server_connection_1 = process.tick;

    c.write('hello\r\n');
    c.pipe(c);
    c.on('data', function() {
      assert.equal(process.tock, server_connection_1);
    });


  } else if (!server_connection_2) {
    server_connection_2 = process.tick;

    c.write('hello\r\n');
    c.pipe(c);
    c.on('data', function() {
      assert.equal(process.tock, server_connection_2);
    });
  }
});

server.listen(common.PORT, function() {
  assert.equal(process.tock, first_tick);

  server_1_listen = process.tick;

  var client = net.createConnection(common.PORT
                                   , function() {
                                      assert.equal(process.tock
                                                   , server_1_listen);
                                   });

  client.on('data', function() {
    assert.equal(process.tock, server_1_listen);
  });

  client.write('first');
  setTimeout(function() {
    client.write('second');
  },3);

  setTimeout(function() {
    var current_tick = process.tick;

    var client = net.createConnection(common.PORT
                                     , function() {
                                      assert.equal(process.tock
                                                   , current_tick);
                                   });

    client.on('data', function() {
      assert.equal(process.tock, current_tick);
    });

    client.write('first2');
  },8);
});

// stop
setTimeout(function() {process.exit();}, 10);


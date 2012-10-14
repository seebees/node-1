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

var connect_1_tick;
var connect_2_tick;

var connected_1_tick;
var connected_2_tick;

var con1_data;
var con2_data;

process.on('exit', function() {
  // check general order of ticks
  // here to make sure they all fire
});

// Create a server to check connections
var server_1 = net.createServer(function(connection) {
  // this tock should be the same as the first tick
  assert.equal(process.tock, first_tick);

  // first connection
  if (!connect_1_tick) {
    // store this tick and connection
    var con1 = connection;

    // When the connection recives data the tock
    // should point back to the current tick
    connect_1_tick = process.tick;
    con1.on('data', function(data) {
      assert.equal(process.tock, connect_1_tick);

      // if we write some data back, the tock should point
      // back to the current tick
      con1_data = process.tick;
      con1.write('at', function() {
        assert.equal(process.tock, con1_data);
      });
    });
  } else if (!connect_2_tick) {
    // store this tick and connection,
    // good to have multipule things running, to make sure
    // we are doing the right things
    var con2 = connection;
    connect_2_tick = process.tick;

    // again, the connection recives data, the tock
    // should point to this tick
    con2.on('data', function(data) {
      assert.equal(process.tock, connect_2_tick);

      // the same with writeing back data
      con2_data = process.tick;
      con2.write('back', function() {
        assert.equal(process.tock, con2_data);
      })
    });
  }
});

// Kick off a listening server, when it's ready,
// kick off the client side of these tests
server_1.listen(common.PORT, function() {
  // tock should point to the first tick
  // because we are listeing off of the starting "loop"
  assert.equal(process.tock, first_tick);

  // to keep me honest, run two clients to make sure all the numbers add up

  server_1_listen = process.tick;
  var con1 = net.createConnection(common.PORT)
      .on('connect', function() {
        // as before, tock should point to the right tick
        assert.equal(process.tock, server_1_listen);
        connected_1_tick = process.tick;

        // the write tock should point back to 
        // the connect tick
        con1.write('asdf', function() {
          assert.equal(process.tock, connected_1_tick);
        });
      })
      // The connection is created in the "listen" tick
      // so our tock should point to that
      .on('data', function(data) {
        assert.equal(process.tock, server_1_listen);

        // this second write should point to the
        // "data" tick
        var data_tick = process.tick;
        con1.write('asdf', function() {
          assert.equal(process.tock, data_tick);
        });
      });

  var con2 = net.createConnection(common.PORT)
      .on('connect', function() {
        // the connect tock should point to the "listen" event
        assert.equal(process.tock, server_1_listen);

        connected_2_tick = process.tick;
        con2.write('qwer', function() {
          // write event tock should point to the connected event
          assert.equal(process.tock, connected_2_tick);

          // problem?
          con2.on('data', function(data) {
            assert.equal(process.tock, server_1_listen);
          });
        });
      });
});

// stop
setTimeout(function() {process.exit();}, 10);


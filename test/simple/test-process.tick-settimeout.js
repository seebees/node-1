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

var first_tick = process.tick;
var setTimeout_10;
var setTimeout_15;
var setTimeout_20;

// make sure this ticks are going in the right direction
process.on('exit', function() {
  assert(setTimeout_20 > setTimeout_15);
  assert(setTimeout_15 > setTimeout_10);
  assert(setTimeout_10 > first_tick);
});

// setTimeout to spin the event loop
setTimeout(function() {
  setTimeout_10 = process.tick
  // tock should be the tick we started from
  assert.equal(process.tock, first_tick);

  // make sure if we nest it, it still works
  setTimeout(function() {
    setTimeout_15 = process.tick;
    // tock should be the tick we started from
    assert.equal(process.tock, setTimeout_10);
  }, 5);
}, 10);

// run another setTimeout to make sure we don't cross polinate
setTimeout(function() {
  setTimeout_20 = process.tick;
  // tock should be the tick we started from
  assert.equal(process.tock, first_tick);
}, 20);


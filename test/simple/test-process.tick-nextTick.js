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
var first_tock = process.tock;
var second_tick;
var third_tick;
var fourth_tick;

// make sure this ticks go in the right direction
process.on('exit', function() {
  assert(fourth_tick > third_tick);
  assert(third_tick > second_tick);
  assert(second_tick > first_tick);
});

// same stack? same tick, same tock
(function() {
  assert.equal(process.tick, first_tick);
  assert.equal(process.tock, first_tock);
}())


// nextTick should increement tick and have the right tock
process.nextTick(function() {
  second_tick = process.tick
  assert.equal(process.tock, first_tick);
  // this is the first nextTick on the stack, so it's tick
  // value should be only 1 more.
  assert.equal(process.tick, first_tick + 1);
})

// mulitpule nextTicks should not cross polinate
process.nextTick(function() {
  third_tick = process.tick
  assert.equal(process.tock, first_tick);

  process.nextTick(function() {
    fourth_tick = process.tick;
    // as we go down the nextTick tock should be the right value
    assert.equal(process.tock, third_tick);
  });
});




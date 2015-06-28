var test = require('tape')
var through = require('through2')
var createParser = require('opc/parser')
var createPixelStream = require('../')

test('send some pixels', function (t) {
  var input = through.obj()

  input
  .pipe(createPixelStream(0))
  .pipe(createParser())
  .on('data', function (message) {
    t.equal(message.channel, 0)
    t.equal(message.command, 0)
    t.equal(message.data.length, 4 * 3)
    t.deepEqual(message.data.toJSON().data, [
      255, 0, 0,
      0, 128, 0,
      0, 0, 255,
      255, 255, 255
    ])
    t.end()
  })
  
  input.write({
    shape: [2, 2],
    data: [ 'red', 'green', 'blue', 'white' ]
  })
})

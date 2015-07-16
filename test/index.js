var test = require('tape')
var through = require('through2')
var createParser = require('opc/parser')
var createPixelStream = require('../')
var Ndarray = require('ndarray')

test('send some pixels', function (t) {
  var input = through.obj()

  var data = new Uint8Array([
    255, 0, 0,
    0, 255, 0,
    0, 0, 255,
    255, 255, 255
  ])

  var expected = [
    255, 0, 0,
    0, 255, 0,
    255, 255, 255,
    0, 0, 255
  ]

  input
  .pipe(createPixelStream(0))
  .pipe(createParser())
  .on('data', function (message) {
    t.equal(message.channel, 0)
    t.equal(message.command, 0)
    t.equal(message.data.length, 4 * 3)
    t.deepEqual(
      message.data.toJSON().data,
      expected
    )
    t.end()
  })


  input.write(Ndarray(
    data,
    [2, 2, 3]
  ))
})

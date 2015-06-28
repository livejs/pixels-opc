var test = require('tape')
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
    t.end()
  })
  
  input.write({
    shape: [2, 2],
    data: [ 'red', 'green', 'blue', 'white' ]
  })
})

const test = require('tape')
const pull = require('pull-stream')
const createParser = require('pull-opc/decoder')
const createPixelStream = require('../')
const Ndarray = require('ndarray-pack')

test('send some pixels', function (t) {
  var array = Ndarray([
    [
      [255, 0, 0], // 0,0 - r
      [0, 255, 0] // 0,1 - g
    ],
    [
      [0, 0, 255], // 1,0 - b
      [255, 255, 255] // 1,1 - w
    ]
  ])

  // 1 b-w
  //     |
  // 0 r-g
  var expected = [
    255, 0, 0, // 0,0 - r
    0, 255, 0, // 0,1 - g
    255, 255, 255, // 1,1 - w
    0, 0, 255 // 1,0 - b
  ]

  pull(
    pull.values([array]),
    createPixelStream(),
    createParser(),
    pull.drain(message => {
      t.equal(message.channel, 0)
      t.equal(message.command, 0)
      t.equal(message.data.length, 4 * 3)
      t.deepEqual(
        message.data.toJSON().data,
        expected
      )
      t.end()
    })
  )
})

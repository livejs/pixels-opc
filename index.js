var reduce = require('lodash.reduce')
var Writable = require('readable-stream').Writable
var inherits = require('inherits')
var duplexer = require('reduplexer')
var defined = require('defined')
var createOpcStream = require('opc')
var createStrand = require('opc/strand')
module.exports = createPixelsStream

function createPixelsStream (channel) {
  var channel = defined(channel, 0)

  var opc = createOpcStream()

  var pixels = new PixelStream({
    opc: opc,
    channel: channel
  })

  return duplexer(pixels, opc, {
    objectMode: true
  })
}

inherits(PixelStream, Writable)
function PixelStream (opts) {
  Writable.call(this, {
    objectMode: true,
    highWaterMark: 1
  })
  this.opc = opts.opc
  this.channel = opts.channel
}

PixelStream.prototype._write = function write (pixels, enc, cb) {
  var length = reduce(pixels.shape, mult) / pixels.shape[pixels.shape.length - 1]
  var strand = createStrand(length)
  var d = pixels.data

  // TODO support n-dimensions
  // TODO support with or without daisy chaining grid
  for (var i = 0; i < pixels.shape[0]; i++) {
    for (var j = 0; j < pixels.shape[1]; j++) {
      var bi = pixels.index(i, j, 0)
      var si = (i % 2 === 0) ?
        bi / 3 : pixels.index(i, j + pixels.shape[0] - (2 * (j % pixels.shape[0])) - 1, 0) / 3
      strand.setPixel(si, d[bi], d[bi + 1], d[bi + 2])
    }
  }

  this.opc.writePixels(this.channel, strand.buffer)
  cb()
}

function mult (x, y) { return x * y }

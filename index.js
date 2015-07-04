var reduce = require('lodash.reduce')
var Writable = require('readable-stream').Writable
var inherits = require('inherits')
var duplexer = require('reduplexer')
var defined = require('defined')
var createOpcStream = require('opc')
var createStrand = require('opc/strand')
var Color = require('tinycolor2')

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
    objectMode: true
  })
  this.opc = opts.opc
  this.channel = opts.channel
}

PixelStream.prototype._write = function write (pixels, enc, cb) {
  var length = reduce(pixels.shape, mult) / pixels.shape[pixels.shape.length - 1]
  var strand = createStrand(length)
  var d = pixels.data
  
  for (var i = 0, ii = 0; i < length; i++, ii += 3) {
    strand.setPixel(i, d[ii], d[ii + 1], d[ii + 2])
  }

  this.opc.writePixels(this.channel, strand.buffer)
  cb()
}

function mult (x, y) { return x * y }

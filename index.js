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

PixelStream.prototype._write = function write (ndpixels, enc, cb) {
  var length = reduce(ndpixels.shape, mult)
  var strand = createStrand(length)
  
  for (var i = 0; i < length; i++) {
    var color = ndpixels.data[i]
    var rgb = Color(color).toRgb()
    strand.setPixel(i, rgb.r, rgb.g, rgb.b)
  }

  this.opc.writePixels(this.channel, strand.buffer)
  cb()
}

function mult (x, y) { return x * y }

var reduce = require('lodash.reduce')
var through = require('through2')
var defined = require('defined')
var createOpcStream = require('opc')
var createStrand = require('opc/strand')
var Color = require('tinycolor2')

function createNdpixelsStream (channel) {
  var channel = defined(channel, 0)

  var opcStream = createOpcStream()

  var stream = through.obj(function (ndpixels, enc, cb) {
    function mult (x, y) { return x * y }
    var length = reduce(ndpixels.shape, mult)
    var strand = createStrand(length)
    
    for (var i = 0; i < length; i++) {
      var color = ndpixels.data[i]
      var rgb = Color(color).toRgb()
      strand.setPixel(i, rgb.r, rgb.g, rgb.b)
    }

    opcStream.writePixels(channel, strand.buffer)
  })

  return stream
}

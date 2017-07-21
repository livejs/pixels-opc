const cwise = require('cwise')
const curry = require('@f/curry-once')
const defaults = require('@f/defaults')
const createStrand = require('opc/strand')

const encodePixels = curry(cwise({
  args: ['scalar', 'scalar', 'scalar', 'shape', 'index', { blockIndices: -1 }],
  pre: function (createStrand, getLength, options, shape) {
    this.daisyChain = options.daisyChain
    var length = getLength(shape)
    this.strand = createStrand(length)
  },
  body: function (c, g, o, shape, index, pixel) {
    // TODO support n-dimensions
    // TODO support with or without daisy chaining grid
    var nextPixelIndex
    switch (shape.length) {
      case 1:
        nextPixelIndex = index[0]
        break
      case 2:
        var xIndex
        if (this.daisyChain) {
          //
          // 3 x-x-x-x
          // |       |
          // 2 x-x-x-x
          // | |
          // 1 x-x-x-x
          // |       |
          // 0 x-x-x-x
          //   0-1-2-3
          //
          // if row is odd, change index based on daisy chain logic
          xIndex = (index[1] % 2 === 0)
            ? index[0]
            : (shape[0] - 1) - index[0]
        } else {
          xIndex = index[0]
        }
        nextPixelIndex = xIndex + index[1] * shape[0]
        break
      default:
        throw new Error('ndpixels-opc: ' + shape.length + ' dimension ndpixels not implemented!')
    }
    this.strand.setPixel(nextPixelIndex, pixel[0], pixel[1], pixel[2])
  },
  post: function () {
    return this.strand.buffer
  },
  funcName: 'pixelsToApa102Buffer'
}))(createStrand, getLength)

module.exports = {
  encodePixels: function (pixels, options = {}) {
    options = defaults(options, {
      daisyChain: false
    })
    return encodePixels(options, pixels)
  }
}

function getLength (shape) {
  switch (shape.length) {
    case 2:
      return shape[0] * shape[1] * 3
    case 3:
      return shape[0] * 3
    default:
      throw new Error('ndpixels-opc: ' + shape.length + ' dimension ndpixels not implemented!')
  }
}

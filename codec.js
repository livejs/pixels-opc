const cwise = require('cwise')
const curry = require('@f/curry-once')
const createStrand = require('opc/strand')

const encodePixels = curry(cwise({
  args: ['scalar', 'scalar', 'shape', 'index', { blockIndices: -1 }],
  pre: function (createStrand, getLength, shape) {
    var length = getLength(shape)
    this.strand = createStrand(length)
  },
  body: function (c, g, shape, index, pixel) {
    // TODO support n-dimensions
    // TODO support with or without daisy chaining grid
    var nextPixelIndex
    switch (shape.length) {
      case 1:
        nextPixelIndex = index[0]
        break
      case 2:
        // for two dimensional arrays, we expect the grid is daisy-chained:
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
        var xIndex = (index[0] % 2 === 0)
          ? index[1]
          : (shape[1] - 1) - index[1]
        nextPixelIndex = xIndex + index[0] * shape[0]
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
  encodePixels
}

function getLength (shape) {
  return shape.reduce(multiply, 1)
}

function multiply (a, b) { return a * b }

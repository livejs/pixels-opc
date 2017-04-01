const pull = require('pull-stream/pull')
const pullMap = require('pull-stream/throughs/map')
const createPixelsEncoder = require('pull-opc/encoder')

const { encodePixels } = require('./codec')

module.exports = createPixelsStream

function createPixelsStream (channel = 0) {
  return pull(
    pullMap(encodePixels),
    createPixelsEncoder(channel)
  )
}

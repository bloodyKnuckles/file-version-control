var fs = require('fs')
var diff = require('diff')

module.exports = function (opts) {
  opts = opts || {}
  var filedir = 'string' === typeof opts? opts: opts.filedir

  var fileVC = {
    opts: opts,

    open: function open () {
      return 'hey'
    }

  }
  return fileVC
}


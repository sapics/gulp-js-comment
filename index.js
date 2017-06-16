const through = require('through2')
const gutil = require('gulp-util')
const PluginError = gutil.PluginError
const exec = require('child_process').exec
const fs = require('fs')
const os = require('os')
const path = require('path')
const acorn = require('acorn')
const PLUGIN_NAME = 'gulp-js-comment'

var pk = 0
const PRE = 'jscomment' + Date.now() + '_'

function _jsComment(file, options, cb, srcString){
  var comments = [], str = srcString
  try{
    acorn.parse(str, {
      onComment: comments
    })
  }catch(err){
    return cb(new PluginError(PLUGIN_NAME, err))
  }

  if(comments.length){
    var i, len = comments.length, commentBlock
    if(options.commentFile){
      var commentText = ''
      for(i = 0; i < len; ++i){
        commentText += '/*' + comments[i].value + "*/\n"
      }
      fs.writeFile(options.commentFile, commentText, {
        flag: options.commentAppend ? 'a' : 'w'
      })
    }

    if (options.strip) {
      comments.sort(function(a, b){return a.end - b.end})
      for(i = len; i--; ){
        commentBlock = comments[i]
        str = str.slice(0, commentBlock.start) + str.slice(commentBlock.end + 1)
      }
      if (file.isBuffer()){
        file.contents = new Buffer(str)
      } else {
        var tmpPath = path.join(os.tmpdir(), PRE + (pk++) + '.js')
        fs.writeFile(tmpPath, str, function(){
          file.contents = fs.createReadStream(tmpPath)
          cb(null, file)
        })
        return;
      }
    }
  }
  cb(null, file)
}

module.exports = function jsComment(opts) {
  if (!opts) opts = {};
  return through.obj(function(file, enc, cb) {
    if (file.isBuffer()) {
      return _jsComment(file, opts, cb, file.contents.toString('UTF-8'))
    }
    if (file.isStream()){
      return streamToString(file, function(str){
        _jsComment(file, opts, cb, str)
      })
    }
    cb(null, file)
  })
}

var streamToString = function(stream, callback) {
  var str = ''
  stream.on('data', function(chunk) {
    str += chunk
  })
  stream.on('end', function() {
    callback(str)
  })
}

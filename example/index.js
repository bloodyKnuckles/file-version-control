var fileVC = require('../')('/example/public')
var sanifile = require('sanitize-filename')

var http = require('http')
var fs = require('fs')
var body = require('body/any')

var filedir = 'example/public'

http.createServer(function (req, res) {
  if ( '/home' === req.url || '/' === req.url ) {
    res.end('home')
  }
  else if ( '/edit' === req.url ) {
    editFiles()
  }
  else if ( 0 === req.url.indexOf('/edit/') ) {
    editFileName()
  }
  else if ( '/edit/home' === req.url ) {
    res.end('home')
  }
  else if ( '/edit/about' === req.url ) {
    res.end('about')
  }
  else if ( 0 === req.url.indexOf('/deletefile/') ) {
    var filename = sanifile(getReqRsrc().resource)
    fs.unlink(filedir + '/' + filename, function () {
      res.end(req.url)
    })
  }

  else if ( 'POST' === req.method ) {
    body(req, res, function (err, postvars) {
      if ( '/post' === req.url || 0 === req.url.indexOf('/post/') ) {
        postFile(postvars)
      }
    })
  }
  else { redirect('/edit') }


  /* FUNCTIONS */


  function postFile (postvars) {
    fs.access(postvars.filename, fs.R_OK | fs.W_OK, function (err) {
      if ( err ) { fs.open(filedir + '/' + postvars.filename, 'w', function (err) {
          if ( err ) throw err
          var ws = fs.createWriteStream(filedir + '/' + sanifile(postvars.filename))
          ws.write(postvars.data)
          ws.end()
        })
      }
      if ( !req.headers['X-Requested-With'] || 'XMLHttpRequest' !== req.headers['X-Requested-With'] ) {
        redirect('/edit')
      }
    })
  }

  function editFileName () {
    var filename = sanifile(getReqRsrc().resource)
    fs.readFile(filedir + '/' + filename, function (err, data) {
      data = data || ''
      res.write('<p>filename: <input type="text" id="filename" value="' + filename + '"></p>')
      res.write('<form id="editfileform" method="post" action="/post/' + filename + '">')
      res.write('<input type="hidden" name="filename" value="' + filename + '">')
      res.write('<input type="button" name="save" value="Save">&nbsp;&nbsp;<input type="submit"><br>')
      res.write('<textarea name="data" cols="80" rows="40">' + data + '</textarea><br>')
      res.write('<input type="button" name="save" value="Save">&nbsp;&nbsp;<input type="submit"></form>')
      res.write('<script>document.getElementById("filename").addEventListener("blur", function (evt) {')
      res.write('var eff = document.getElementById("editfileform"); ') 
      res.write('eff.action="/post/" + evt.target.value; eff.filename.value=evt.target.value}); ')
      res.write('Array.prototype.forEach.call(document.querySelectorAll("#editfileform input[type=button][name=save]"), ')
      res.write('function (save) {save.addEventListener("click", function (evt) {')
      res.write('var eff = evt.target.parentNode; filename = eff.filename.value; var data = eff.data.value; ')
      res.write('var xhr = new XMLHttpRequest(); xhr.open("POST", eff.action, true); ')
      res.write('xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); ')
      res.write('xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); ')
      res.write('xhr.send("filename=" + filename + "&data=" + data);})})</script>')
      res.end()
    })
  }

  function editFiles () {
    fs.readdir(filedir, function (err, files) {
      files && files.forEach(function (file) {
        res.write('<div><a class="delete" href="#">X</a>')
        res.write('&nbsp;&nbsp;<a class="file" href="/edit/' + file + '">' + file + '</a></div>')
      })
      res.write('<p>new: <input id="newfile" name="filename" type="text"></p>')
      res.write('<script>document.getElementById("newfile").addEventListener(')
      res.write('"keypress", function (evt) { if ( 13 === evt.keyCode ) {')
      res.write('location.href="/edit/" + evt.target.value; }}); ')
      res.write('Array.prototype.forEach.call(document.querySelectorAll(".delete"), ')
      res.write('function (del) {del.addEventListener("click", function (evt){')
      res.write('var filename = evt.target.parentNode.querySelector(".file").textContent; ')
      res.write('var xhr = new XMLHttpRequest(); xhr.open("GET", "/deletefile/" + filename, true); ')
      res.write('xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); ')
      res.write('xhr.onload = function () { console.log(xhr.responseText); }; xhr.send(); ')
      res.write('evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);})')
      res.write('})</script>')
      res.end()
    })
  }

  function getReqRsrc () {
    var parts = req.url.split('?')
    var components = parts[0].split('/')
    return {
      action: components[1],
      resource: components[2],
      querystr: parts[1]
    }
  }

  function redirect (where) {
    res.writeHead(307, {'Location': where})
    res.end()
  }

}).listen(8080, 'localhost')


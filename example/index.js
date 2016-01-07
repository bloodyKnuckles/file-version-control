var fileVC = require('../')('/example/public')

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
    editFileName(req.url.split('?')[0].split('/')[2])
  }
  else if ( '/edit/home' === req.url ) {
    res.end('home')
  }
  else if ( '/edit/about' === req.url ) {
    res.end('about')
  }

  else if ( 'POST' === req.method ) {
    body(req, res, function (err, postvars) {
      if ( '/post' === req.url ) {
        postNewFile()
      }
      else if ( 0 === req.url.indexOf('/post/') ) {
        postFile()
      }
    })
  }
  else { res.end('terminus') }


  function postFile () {
  }

  function editFileName (filename) {
    fs.readFile(filedir + '/' + filename, function (err, data) {
      res.write('<h1>' + filename + '</h1>')
      res.write('<form method="post" action="/post/' + filename + '"><input type="submit"><br>')
      res.write('<textarea cols="80" rows="40">' + data + '</textarea><br>')
      res.write('<input type="submit"></form>')
      res.end()
    })
  }

  function editFiles () {
    fs.readdir(filedir, function (err, files) {
      files && files.forEach(function (file) {
        res.write('<a href="/edit/' + file + '">' + file + '</a><br>')
      })
      res.end(
        '<p><form method="post" action="/post">new: <input name="newfile" type="text"></form></p>'
      )
    })
  }

  function postNewFile () {
    fs.access(postvars.newfile, fs.R_OK | fs.W_OK, function (err) {
      if ( err ) {
        fs.open(filedir + '/' + postvars.newfile, 'w', function (err) {
          if ( err ) throw err
        })
      }
      redirect('/edit/' + postvars.newfile)
    })
  }

  function redirect (where) {
    res.writeHead(307, {'Location': where})
    res.end()
  }

}).listen(8080, 'localhost')



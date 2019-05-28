var createError = require('http-errors')
var path = require('path')
var fs = require('fs')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var express = require('express')
var app = express()
var server = require('http').createServer(app);
var io = require('socket.io')(server)



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//Pour creer la variable images pour la version portable

fs.readdir(path.join(__dirname, 'public', 'images'), (err, files) => {
  if (!err) {
    fs.writeFile('images.js', `var images = ${JSON.stringify(files)}`, err => {
      if (!err){
        console.log('images.js créer')
      }
    })
  }
})

//not work
/*
var connectIO = (req, res, next) => {
	io.on('connection', (socket) => {
		req.io = io
		
	})
	next()
}

*/

// routage
app.use('/', require('./routes/index'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})


//PORT init
if (!process.env.PORT) {
   if (process.env.NODE_ENV == 'production') {
    process.env.PORT = 5000
  }else{
    process.env.PORT = 5001
  } 
}

app.listen(process.env.PORT, () => {
  console.log(`Listen on the port ${process.env.PORT}`)
})

module.exports = app
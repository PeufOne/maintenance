var express = require('express')
var router = express.Router()
var fs = require('fs')
var path = require('path')

/* GET home page. */
router
	.get('/', (req, res, next) => {
	  res.render('index');
	})
	.get('/images', (req, res, next) => {
		fs.readdir(path.join(__dirname, '..', 'public/images'), (err, files) => {
			if (!err) {
				res.json(files)
			}else next(err)
		})
	})


module.exports = router;

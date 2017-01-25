
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.dev.config')
var fs = require('fs');
var morgan = require('morgan')

var app = express()
var compiler = webpack(config)

app.use(morgan('combined'))

var PLAYERS_FILE = path.join(__dirname, '/data/players.json');

// serve our static stuff like index.css

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath,
	history: true
}))

app.use(webpackHotMiddleware(compiler))

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(__dirname))
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/players', function(req, res) {
	console.log('server.js', res);
	fs.readFile(PLAYERS_FILE, function(err, data) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		res.json(JSON.parse(data));
	});
})

var PORT = process.env.PORT || 8080

app.listen(PORT, 'localhost', function(err) {
	if (err) {
		console.log(err)
		return
	}

	console.log('Listening at http://localhost:8080')
})
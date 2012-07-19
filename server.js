var http = require('http');
var gs = require('./gs');
var express = require('express');
var querystring = require('querystring');

console.log("accessing grooveshark...");
gs.getAccess(function() {

	console.log("booting server...");
	var app = express.createServer();

	app.configure(function() {
		app.use(express.logger());
		app.use(express.static(__dirname + '/public'));
	});

	app.get('/search', function(req, res) {

    	gs.callMethod("getResultsFromSearch", {
			query: req.query.query,
			type: ["Songs","Albums","Artists"],
			guts: 0,
			ppOverride: ""
		}, function(response, body) {
			results = JSON.parse(body).result.result;

			var info = [];

			for (var i in results.Songs) {
				var song = results.Songs[i];
				info[i] = {artist: song.ArtistName, song: song.SongName};
			}
			res.send(JSON.stringify(info));
		});

	});

	app.listen(1989);
});
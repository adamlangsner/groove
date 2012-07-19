var http = require('http'),
	https = require('https'),
	lib = require('./lib'),
	url = require('url');

var session, tokenSalt, token, rand=lib.randHex(6), uuid="453DE657-B3B2-4088-BCE1-8BCD4239A5AC";

var callMethod = function(method, params, callback) {

	var data = {
		header: {
			client: "htmlshark",
			clientRevision: "20120312",
			privacy: 0,
			country: {CC3: 0, CC2: 0, DMA: 501, CC1: 0, IPR: 0, CC4: 1073741824, ID: 223},
			session: session,
			uuid: uuid
		},
		method: method,
		parameters: params
	};

	if (token) {
		data['header']['token'] = rand + lib.sha1(method + ":" + token + ":" + tokenSalt + ":" + rand);
	}

	data = JSON.stringify(data);

	var options = {
		host:'grooveshark.com', 
		path:'/more.php?'+method, 
		method:'POST',
		ssl: true,
		headers: {
			"Content-Length": data.length
		}
	};

	httpRequest(options, data, callback);
}
exports.callMethod = callMethod;

var httpRequest = function(options, data, callback) {
	var req = (options.ssl ? https : http).request(options, function(res) {
		var body = '';
		res.on('data', function(chunk) { body += chunk; });
		res.on('end', function() { callback(res, body); });
	});

	if (data) {
		req.write(data);
	}
	req.end();
}

exports.getAccess = function(callback) {

	httpRequest({host: 'grooveshark.com'}, null, function(res, body) {

		session = res.headers['set-cookie'][0].match(/PHPSESSID=([a-fA-F0-9]+?);/)[1];

		url_parts = url.parse(body.match(/app\.src\s*=\s*'(.+?)\?.+?';/)[1]);

		httpRequest({host: url_parts['host'], path: url_parts['path']}, null, function(res, body) {

			tokenSalt = body.match(/revToken\s*:\s*"(\w+?)"/)[1];

			callMethod("getCommunicationToken", {secretKey: lib.md5(session)}, function(res, body) {
				token = JSON.parse(body)['result'];
				callback();
			});
		});
	});
}
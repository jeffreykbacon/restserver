var express = require('express'); 
var https = require('https'); 
var http = require('http'); 
var fs = require('fs'); 
var url = require('url'); 
var app = express();
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
	return((user ==='cs360')&&(pass === 'test'));
});
app.use(bodyParser()); 
var options = { 
	host: '127.0.0.1', 
	key: fs.readFileSync('ssl/server.key'), 
	cert: fs.readFileSync('ssl/server.crt') 
}; 
http.createServer(app).listen(80); 
https.createServer(options, app).listen(443); 
app.get('/', function (req, res) { 
	res.send("Get Index"); 
});
app.use('/', express.static('./html', {maxAge: 60*60*10}));
app.get('/getcity', function (req, res) {
	//console.log("In getcity route");
	//res.json([{city:"Price"},{city:"Provo"}]);
	var urlObj = url.parse(req.url, true, false);
	//console.log("IN Getcity");
                fs.readFile("cities.dat.txt", function (err, data) {
                        if (err) throw err;
                        var cities = data.toString().split("\n");
                        var myRe = new RegExp("^"+urlObj.query["q"]);
                        //console.log(myRe);
                        var jsonresult = [];
                        for (var i = 0; i < cities.length; i++) {
                                var result = cities[i].search(myRe);
                                if(result != -1) {
                                        //console.log(cities[i]);
                                        jsonresult.push({city:cities[i]});
                                }
                        }
                        //console.log(jsonresult);
                        //console.log(JSON.stringify(jsonresult));
                        res.writeHead(200);
                        res.end(JSON.stringify(jsonresult));
                });
});
	app.get('/comment', function (req, res) {
		//console.log("In comment route");
		//resarray = [ { Name: 'Mickey', Comment: 'Hello', 
			//_id: '54f53d5ebf89e6100c2180da' }, 
			//{ Name: 'Mark', Comment: 'This is a comment', 
			//_id: '54f53e21801a52330c04be8a' } 
			//] 
		//res.json(resarray);
		//console.log("In GET");
                        var MongoClient = require('mongodb').MongoClient;
                        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
                                if(err) throw err;
                                db.collection("comments", function(err, comments){
                                        if(err) throw err;
                                        comments.find(function(err, items){
                                                items.toArray(function(err, itemArr){
                                                        //console.log("Document Array: ");
                                                        //console.log(itemArr);
                                                        //res.writeHead(200);
                                                        //res.end(JSON.stringify(itemArr));
                                                        res.json(itemArr);
                                                });
                                        });
                                });
                        });
	});
	app.post('/comment', auth,  function (req, res) {
		//console.log("In POST comment route");
		//console.log(req.user);
		//console.log(req.body);
		//console.log(req.body.Name);
		//console.log(req.body.Comment);
		//console.log("Remote User");
		//console.log(req.remoteUser);
		//console.log("POST comment route");
                        //var jsonData = "";
                        //req.on('data', function (chunk) { jsonData += chunk; });
                        //req.on('end', function () {
                                //var reqObj = JSON.parse(jsonData);
                                //console.log(reqObj);
                                //console.log("Name: "+reqObj.Name);
                                //console.log("Comment: "+reqObj.Comment);
				var reqObj = req.body;
                                var MongoClient = require('mongodb').MongoClient;
                                MongoClient.connect("mongodb://localhost/weather", function(err, db) {
                                        if(err) throw err;
                                        db.collection('comments').insert(reqObj,function(err, records) {
                                        //console.log("Record added as "+records[0]._id);
                                        //res.writeHead(200);
                                        //res.end("");
                                        res.status(200);
					res.end();
                                });
                        });
                        //});
		//res.status(200);
		//res.end();
		//res.status(200);
		//res.end();
	});

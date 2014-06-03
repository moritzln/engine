"use strict";

/*----------------------Requirements-----------------------*/

var notifier = require('mail-notifier');
var mysql = require('mysql');	
var webSocketServer = require('websocket').server;
var http = require('http');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var schedule = require('node-schedule');
var analyse = require("./analyse.js");
var setSchedule = require("./scheduler.js");

/*-------------------------Servers-------------------------*/

var webSocketsServerPort = 8081;
var server = http.createServer(function(request, response) {
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

/*----------Helper functions - String replacement----------*/

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;') //.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function mysqlInjection(str){
	return String(str).replace(/'/g, '\\\'');	
}

/*-----------------------Connection------------------------*/

var clients = {};

//Fired if someone connects to the Server
wsServer.on('request', function(request) {
	//Log it into the console
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
	//User not authenticated yet
	request["httpRequest"]["client"]["authenticated"] = false;
	//Accept request
	var connection = request.accept(null, request.origin);
	//MYSQL-Connection
	var connectionMy = mysql.createConnection({
	  host : 'localhost',
	  port : 3306,
	  database: 'EngineX',
	  user : 'Moritz',
	  password : 'mor!tz98'
	});	
	connectionMy.connect(function(err){//Mysql-Connect
		if(err != null) {
				var result = "There was an error connecting to the database.";
				console.log("Connection-Error: "+err)
		}else{
	 
			//Message received
			connection.on('message', function(message) {
				if (message.type === 'utf8') { // accept only text
					//------------------User not authenticated------------------
					if(request["httpRequest"]["client"]["authenticated"] == false){
						var message = mysqlInjection(message.utf8Data.toLowerCase());
						connectionMy.query("SELECT * FROM  `users` WHERE  `authentication_code` =  '"+message+"' LIMIT 1", function(err, rows){
							if(err != null) {
								var result = "Error while searching the databases!";
								console.log(err); 
							} else {
								if(rows[0] != undefined){
									request["httpRequest"]["client"]["authenticated"] = true;
									request["httpRequest"]["client"]["user"] = rows[0];
									request["httpRequest"]["client"]["path"] = rows[0]["username"];
									clients[rows[0]["username"]] = connection;
									clients[rows[0]["username"]]['user'] = rows[0];
									connectionMy.query("UPDATE `users` SET `online` =  'online' WHERE `id` = "+rows[0]["id"]);
									
									setSchedule(connectionMy, request, connection);
									
									var usersName = rows[0]["first_name"]+" "+rows[0]["last_name"];
									var result = "<script>msg.text = \"User "+usersName+" authenticated. Full access granted, Sir!\"; window.speechSynthesis.speak(msg); content.append(msg.text);</script>";
									console.log("Successfully authenticated "+usersName);								
								}else{
									var result = "<script>msg.text = \"User not authenticated\"; window.speechSynthesis.speak(msg);</script>User not authenticated!";	
									console.log("Message from unknown: Authentification failed!");
								}
								var obj = {
									time: (new Date()).getTime(),
									text: result
								};
								connection.sendUTF(JSON.stringify( { type: 'replace', data: obj} ));
							}
						});
					//--------------------User authenticated--------------------
					}else{
						console.log(request["httpRequest"]["client"]["user"]["first_name"]+" "+request["httpRequest"]["client"]["user"]["last_name"]+": "+message.utf8Data);	
						if(message.utf8Data == "goodbye"){
							request["httpRequest"]["client"]["authenticated"] = false;	
							var result = "<script>msg.text = \"Goodbye Mister "+request["httpRequest"]["client"]["user"]["last_name"]+".\"; window.speechSynthesis.speak(msg);</script>Goodbye Mister "+request["httpRequest"]["client"]["user"]["last_name"]+".";
							var obj = {
							  time: (new Date()).getTime(),
							  text: result
							};
							connection.sendUTF(JSON.stringify( { type: 'replace', data: obj} ));
						}else{
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							analyse(message, connection, connectionMy, request, clients);
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						}
					}
				}
			});//connection.on('message')
			// user disconnected
			connection.on('close', function(connection) {
				connectionMy.query("UPDATE `users` SET `online` =  'offline' WHERE `username` = '"+request["httpRequest"]["client"]["path"]+"'");
				console.log(request["httpRequest"]["client"]["path"]+" closed the connection.");
			});	
		}//error?
	});//connectionMy.connect
});//wsServer.on('request')
	
wsServer.on('error', function(err){
	console.log(err);
});
var modules = require("./modules.js");

//Helper functions - String replacement
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;') //.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function mysqlInjection(str){
	return String(str).replace(/'/g, '\\\'');	
}

//Main-Function: Analysing the query and giving the result
var analyse = function(message, connection, connectionMy, request, clients){
	var query = mysqlInjection(message.utf8Data.toLowerCase().split("|")[0]);
	var result = "Anfrage nicht verarbeitet.";
	
	connectionMy.query("SELECT * FROM  `SpeechRecognition` WHERE  `query` =  '"+query+"'", function(err, rows){
			// Error?
			if(err != null) {
				var result = "There was an error looking up your information.";
				console.log(err); 
			} else {
				//Choose one random answer out of the possibilities
				var number = rows.length;
				var n = Math.floor(Math.random()*(number));
				
				if(rows[n] != undefined){
					var result = htmlEntities(rows[n]["response"]);
					var type = rows[n]["type"];
				}else{
					var result = "No results found for \'"+message.utf8Data+"\'.";
					var type = "text";
				}
				
				//Process the results from the database
								
				if(type == "text"){ 					//Process Text-Commands
						var messageType = "replace";
						var output = modules.text(result); 
				}else if (type == "fhem"){ 				//Process FHEM-HpmeControl-Commands
						var messageType = "replace";
						var output = "<iframe style='display: none;' src='"+result+"'></iframe><script>msg.text = \"Job done.\"; window.speechSynthesis.speak(msg);</script>Job done.";	
				}else if (type == "audio"){ 			//Process commands requesting audio files
						var messageType = "background";
						var output = modules.audio(result);
				}else if (type == "audio controls"){ 	//Control audio files
						var messageType = "add";
						var output = modules.audiocontrols(result);
				}else if (type == 'time'){ 				//Give back the time
						var messageType = "replace";
						var output = modules.time();
				}else if (type == "timetable"){ 		//Read out the timetable
						var messageType = "replace";
						var output = modules.timetable(result, request);
				}else if(type == "weather"){ 			//Tell the weather
						var messageType = "replace";
						var output = modules.weather(result);
				}else if(type == "message"){ 			//Send a message
						var messageType = "replace";
						modules.message(message, connectionMy, clients, connection, request);
				}
				var obj = {
					time: (new Date()).getTime(),
					text: output
				};
				connection.sendUTF(JSON.stringify( { type: messageType, data: obj } ));
			}
	}); 
}
module.exports = analyse;
//Text-Results

var text = function(result){
	var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
	return result;	
}

//FHEM-Functions: Light, Heating, Shutters

var fhem = function(result){
		
}

//Audio-Elements: Music, Cites...

var audio = function(result){
	var messageType = "background";
	var result = "<audio id='audio' autoplay='autoplay'><source src='audio/"+result+"' type='audio/mpeg' />Sorry - Ihre Browser hat keine Unterstützung für dieses Audio-Format.</audio><script>setVolume(0.2);</script>";	
	return result;
}

//Audio-Controls: Louder, Pause, Play...

var audiocontrols = function(result){
	var messageType = "add";
	var result = "<script>document.getElementById('audio')."+result+";</script>";	
	return result;
}

//Time

var time = function(){
	var d = new Date ();
	var h = (d.getHours () < 10 ? '0' + d.getHours () : d.getHours ());
	var m = (d.getMinutes () < 10 ? '0' + d.getMinutes () : d.getMinutes ());
	var result = "<script>msg.text = \"It's "+h+":"+m+" o'clock.\"; window.speechSynthesis.speak(msg);</script>"+"It's "+h+":"+m+" o'clock.";	
	return result;
}

//Timetable: Userspecific timetable

var timetable = function(result, request){
	var timetable = require("./users/"+request["httpRequest"]["client"]["path"]+"/timetable.js");
	var spl = result.split(", ");
	if(spl[0] != "today"){
		var day = spl[0];	
	}else{
		var date = new Date(); 
		var weekDay = date.getDay(); 
		var daysArray = new Array("sunday","monday","tuesday","wednesday","thursday","friday","saturday");
		var day = daysArray[weekDay];
	}
	if(weekDay != 0 && weekDay != 7){
		var daySubjects = timetable.timetable(day);
		if(spl[1] != undefined){
			var lesson = spl[1];	
			var result = "You are going to have "+daySubjects[spl[1]]+".";
			var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
		}else{
			var result = "You are going to have "+daySubjects.join(", ")+".";
			var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
		}
	}else{
		var result = "You won't have school today.";
		var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
	}	
	
	return result;
}

//Weather-Function

var weather = function(result){
	if(result == "current"){
		var result = "<script>$.getJSON('http://api.openweathermap.org/data/2.5/weather?q=Bitburg&units=metric', function(data){msg.text = data.weather[0].main+'. It is '+data.main.temp+' degrees.'; window.speechSynthesis.speak(msg);  $('#content').append(msg.text);});</script>";
	}else if(result == "tomorrow"){
		var result = "<script>$.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily?q=Bitburg&units=metric&cnt=2', function(data){msg.text = data.list[1].weather[0].main+'. It will be '+data.list[1].temp.day+' degrees.'; window.speechSynthesis.speak(msg);  $('#content').append(msg.text);});</script>";
	}
	return result;
}

//Message-Function

var message = function(message, connectionMy, clients, connection, request){
	connectionMy.query("SELECT * FROM  `users` WHERE  `first_name` =  '"+message.utf8Data.split("|")[1]+"'", function(err, rows){
	if(err != null) {
		var result = "There was an error looking up your information.";
		console.log(err); 
	} else {
		// Shows the result on console window
		if(rows[0] != undefined){
			if(rows[0]["online"] == "online"){
				var message1 = message.utf8Data.split("|")[2];
				var result1 = "<script>msg.text = \"New message from "+request["httpRequest"]["client"]["user"]["first_name"]+"\"; window.speechSynthesis.speak(msg);</script>New message from "+request["httpRequest"]["client"]["user"]["first_name"]+": "+"<script>msg.voice = speechSynthesis.getVoices()[1]; msg.text = \""+message1+"\"; window.speechSynthesis.speak(msg);</script>"+message1+"<script>msg.voice = speechSynthesis.getVoices()[0];</script>";
				var messageType = "replace";
				var obj = {
					time: (new Date()).getTime(),
					text: result1
				};
				clients[rows[0]["username"]].sendUTF(JSON.stringify( { type: messageType, data: obj } ));
				var result = "<script>msg.text = \"Message sent!\"; window.speechSynthesis.speak(msg);</script>Message sent!";
			}else{
				var result = "<script>msg.text = \"User not online!\"; window.speechSynthesis.speak(msg);</script>User not online!";
			}
		}else{
			var result = "<script>msg.text = \"User not found!\"; window.speechSynthesis.speak(msg);</script>User not found!";
		}	
		var obj = {
			time: (new Date()).getTime(),
			text: result
		};
		connection.sendUTF(JSON.stringify( { type: messageType, data: obj } ));
	}
});	
}

//New schedule entry

var schedule = function(){
		
}

module.exports.text = text;
module.exports.fhem = fhem;
module.exports.audio = audio;
module.exports.audiocontrols = audiocontrols;
module.exports.time = time;
module.exports.timetable = timetable;
module.exports.weather = weather;
module.exports.message = message;
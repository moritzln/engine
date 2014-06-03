var schedule = require('node-schedule');
var setSchedule = function(connectionMy, request, connection){
	connectionMy.query("SELECT * FROM  `scheduler` WHERE  `user` =  '"+request["httpRequest"]["client"]["user"]["username"]+"'", function(err, rows){
		var rules = [];
		var j = [];
		for(a in rows){
			if(rows[a]["type"] == "rule"){//-----------------Rules------------------
				rules[a] = 	new schedule.RecurrenceRule();
				if(rows[a]["weekday"] != null){
					var rs = rows[a]["weekday"].split(", ");
					for(var i=0; i<rs.length;i++){
						rs[i] = parseInt(rs[i], 10);
					}
					rules[a].dayOfWeek = rs;
				}
				if(rows[a]["hour"] != null){
					rules[a].hour = rows[a]["hour"];
				}
				if(rows[a]["minute"] != null){
					rules[a].minute = rows[a]["minute"];
				}
				var j = schedule.scheduleJob(rules[a], function(){
					var result = rows[a]["content"];
					var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
					var obj = {
						time: (new Date()).getTime(),
						text: result
					};
					var messageType = "replace";
					connection.sendUTF(JSON.stringify( { type: messageType, data: obj} ));
				});
			}else if(rows[a]["type"] == "date"){//--------------Dates--------------
				var date = new Date(rows[a]["year"], rows[a]["month"], rows[a]["day"], rows[a]["hour"], rows[a]["minute"], 0);

				var j = schedule.scheduleJob(date, function(){
					var result = rows[a]["content"];
					var result = "<script>msg.text = \""+result+"\"; window.speechSynthesis.speak(msg);</script>"+result;
					var obj = {
						time: (new Date()).getTime(),
						text: result
					};
					var messageType = "replace";
					connection.sendUTF(JSON.stringify( { type: messageType, data: obj} ));
				});
			}
		}
	});
}
module.exports = setSchedule;
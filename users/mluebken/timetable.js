function KalenderWoche() { 
	var KWDatum = new Date(); 
	var DonnerstagDat = new Date(KWDatum.getTime() + (3-((KWDatum.getDay()+6) % 7)) * 86400000); 
	KWJahr = DonnerstagDat.getFullYear(); 
	var DonnerstagKW = new Date(new Date(KWJahr,0,4).getTime() + (3-((new Date(KWJahr,0,4).getDay()+6) % 7)) * 86400000); 
	KW = Math.floor(1.5 + (DonnerstagDat.getTime() - DonnerstagKW.getTime()) / 86400000/7); 
	if(KW%2 == 0){
		ab = 0;	
	}else{
		ab = 1;
	}
	
	return(ab);
}

exports.timetable = function timetable(day){
	var ab = KalenderWoche();
	var monday = ["German", "History", "Biology", "Latin", "Maths", "Geography", "Jazz-Combo", "French"];
	if(ab == 0){
		var tuesday = ["Chemistry", "Physics", "Maths", "English", "Music", "Social Studies", "Band", "French"];
	}else{
		var tuesday = ["Chemistry", "Physics", "Maths", "English", "Music", "Social Studies", "Choir", "Informatics"];
	}
	var wednesday = ["German", "Maths", "Social Studies", "Latin", "Geography", "History", "Choir"];
	if(ab == 1){
		var thursday = ["Biology", "English", "Latin", "Physics", "Sports", "Chemistry"];
	}else{
		var thursday = ["Biology", "English", "Latin", "Physics", "Sports"];
	}
	var friday = ["English", "Religous Education", "Maths", "Art", "German", "Chemistry"];
	if(day == "monday"){return monday};
	if(day == "tuesday"){return tuesday};
	if(day == "wednesday"){return wednesday};
	if(day == "thursday"){return thursday};
	if(day == "friday"){return friday};
}


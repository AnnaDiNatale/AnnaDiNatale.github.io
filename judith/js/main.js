const MTURK_SUBMIT = "https://www.mturk.com/mturk/externalSubmit";
const SANDBOX_SUBMIT = "https://workersandbox.mturk.com/mturk/externalSubmit";

//var config = {}
var rangeslider;
var output;
var file;
var comments;
var controlQuest;
var index;
var i=0;
var answers = {id: [],
	       type: [], 
	       rate: [],
	       assignmentId: gup("assignmentId"),
	       workerId: gup("workerId")};
var startDate;
var endDate;
var prod;
var submitUrl;

function toSurvey() {
 	location.replace("survey.html");
}

function toInstructions() {
	location.replace("index.html");
}


function loadIndex(){
    /*$.getJSON("config.json").done(function(data) {
	config = data;
    });*/
}


function add_controlQuestion(){
	var comment_id = document.getElementById("postid");
	var comment_type = document.getElementById("type");
	var comment_title = document.getElementById("title");
	var comment_text = document.getElementById("text");

	comment_id.value = controlQuest.id[0];
	comment_type.value = controlQuest.type[0];

	var title = controlQuest.title[0];
	if (title==null){
		comment_title.textContent = '';
	} else {
		comment_title.textContent = title;
	}

	comment_text.textContent = controlQuest.text[0];
}

function displayControlQuestion(){
	document.getElementById("Instructions").hidden = true;
	document.getElementById("survey").hidden = false;

	var parameters = location.search.substring(1).split("&");
	
	if (parameters != ""){
		var prod_def = parameters[0].split("=");
		prod = unescape(prod_def[1]);
		if (parameters.length == 1){
			var data_file = "survey_test_control_question.json";
		} else {
			var temp = parameters[1].split("=");
			var data_file = "surveys/survey_" + unescape(temp[1]) + ".json";
		}
	} else {
		var data_file = "survey_test_control_question.json";
	}

	$.getJSON(data_file).done(function(data) {  
		file = data;
	    	comments = file.survey;
	    	controlQuest = file.control_question;
		add_controlQuestion();
	});
	
	var bar = document.getElementById("progress-bar");
	bar.style.width = (i+1)/34*100 +'%';
	
	startDate = new Date();
}

function checkControlQuestion(){
	var goodAnswer = false;
	
	if ((document.getElementById('dontUnderstand').checked) & (document.querySelector('input[name="Options"]:checked') != null)){
		document.getElementById('dontUnderstand').checked = false;
		document.querySelector('input[name="Options"]:checked').checked = false;
	} else if (document.getElementById('dontUnderstand').checked) {
		answers.id.push(document.getElementById('postid').value);
		answers.type.push(document.getElementById('type').value);
		answers.rate.push('NA');
		
		endDate = new Date();
		document.getElementById("survey").hidden = true;
		document.getElementById("fail").hidden = false;
	} else if (document.querySelector('input[name="Options"]:checked') != null) {
		var correctAnswer = controlQuest.answer[0];
		
		answers.id.push(document.getElementById('postid').value);
		answers.type.push(document.getElementById('type').value);
		answers.rate.push(document.querySelector('input[name="Options"]:checked').value)
		
		if (correctAnswer == -2) {
			var acceptableAnswers = ["-2","-1"];
		} else if (correctAnswer == 2) {
			var acceptableAnswers = ["1","2"];
		} else if (correctAnswer == 0) {
			var acceptableAnswers = ["-1","0","1"];
		}
		
		if (acceptableAnswers.includes(document.querySelector('input[name="Options"]:checked').value)) {
		    goodAnswer = true;
		}
		
		if (goodAnswer){
			document.querySelector('input[name="Options"]:checked').checked = false;
			
			document.getElementById('control').classList.remove('button');
			document.getElementById('control').hidden = true;
			document.getElementById('next').classList.add('button');
			document.getElementById('next').hidden = false;

			displayInfo();
		} else {
			endDate = new Date();
			document.getElementById("survey").hidden = true;
			document.getElementById("fail").hidden = false;
		}
	}	
}

function submitFailSurvey(){
		
	//var submitUrl = config.hitCreation.production ? MTURK_SUBMIT : SANDBOX_SUBMIT;
	if (prod == "true"){
		submitUrl =  MTURK_SUBMIT;
	} else if (prod == "false"){
		submitUrl = SANDBOX_SUBMIT;
	}

	var form = document.getElementById("submit-form");
	addHiddenField(form, 'assignmentId', answers.assignmentId);
	addHiddenField(form, 'workerId', answers.workerId);
	var results = {
		'id': answers.id,
		'type': answers.type,
		'rate': answers.rate
	};
	addHiddenField(form, 'rates', JSON.stringify(results));
	
	var surveyTime = (endDate - startDate)/1e3;
	var hours = Math.floor((surveyTime)/3600);
	var minutes = Math.floor((surveyTime)%3600/60);
	var seconds = Math.floor((surveyTime)%60);
	var time = hours.toString()+':'+minutes.toString()+':'+seconds.toString();
	addHiddenField(form, 'survey_time', time);
	
	addHiddenField(form, 'gender', 'NA');
	addHiddenField(form, 'age', document.getElementsByName('age')[0].value);
	addHiddenField(form, 'politics', 'NA');

	$("#submit-form").attr("action", submitUrl); 
	$("#submit-form").attr("method", "POST"); 
	$("#submit-form").submit();
}


function add_comment(i){
	index = Object.keys(comments);
	
	var comment_id = document.getElementById("postid");
	var comment_type = document.getElementById("type");
	var comment_title = document.getElementById("title");
	var comment_text = document.getElementById("text");

	comment_id.value = comments[index[i]].postid;
	comment_type.value = comments[index[i]].type;

	var title = comments[index[i]].title;
	if (title==null){
		comment_title.textContent = '';
	} else {
		comment_title.textContent = title;
	}

	comment_text.textContent = comments[index[i]].text;
}

function displayInfo(){
	
	/*document.getElementById("Instructions").hidden = true;
	document.getElementById("survey").hidden = false;

	var parameters = location.search.substring(1).split("&");
	
	if (parameters != ""){
		var temp = parameters[0].split("=");
		var data_file = "surveys/survey_" + unescape(temp[1]) + ".json";
	} else {
		var data_file = "survey_test.json";
	}*/
	
	//var data_file = "survey_test.json";

	/*$.getJSON(data_file).done(function(data) { 
	    comments = data;
	    add_comment(i);
	});*/
	
	add_comment(i);
	
	var bar = document.getElementById("progress-bar");
	//bar.style.width = (i+1)/34*100 +'%';
	bar.style.width = (i+2)/34*100 +'%';
	
	//startDate = new Date();
}

function nextQuestion(){
	if ((document.getElementById('dontUnderstand').checked) & (document.querySelector('input[name="Options"]:checked') != null)){
		document.getElementById('dontUnderstand').checked = false;
		document.querySelector('input[name="Options"]:checked').checked = false;
	} else if ((document.getElementById('dontUnderstand').checked) | (document.querySelector('input[name="Options"]:checked') != null)) {
		answers.id.push(document.getElementById('postid').value);
		answers.type.push(document.getElementById('type').value);
		if (document.getElementById('dontUnderstand').checked){
			answers.rate.push('NA');
			document.getElementById('dontUnderstand').checked = false;
		} else if (document.querySelector('input[name="Options"]:checked') != null) {
			answers.rate.push(document.querySelector('input[name="Options"]:checked').value);
			document.querySelector('input[name="Options"]:checked').checked = false;
		}
		/* test: i_max=2; reality: i_max=28 */
		if (i >= 30){
			document.getElementById('next').classList.remove('button');
			document.getElementById('next').hidden = true;
			document.getElementById('finish').classList.add('button');
			document.getElementById('finish').hidden = false;
		}

		i = i+1;
		add_comment(i);
		var bar = document.getElementById("progress-bar");
		bar.style.width = (i+2)/34*100 +'%';
	}
}

function endSurvey(){
	endDate = new Date();
	
	answers.id.push(document.getElementById('postid').value);
	answers.type.push(document.getElementById('type').value);
	if (document.getElementById('dontUnderstand').checked){
		answers.rate.push('NA');
	} else {
		answers.rate.push(document.querySelector('input[name="Options"]:checked').value);
	}
	
	sessionStorage.setItem("rates", JSON.stringify(answers));
	sessionStorage.setItem("surveyTime", (endDate - startDate)/1e3);
	
	/*var token = document.getElementById('recaptchaResponse').value;
	$.ajax({
		url: "captcha.php",
		type: "POST",
		data: {recaptcha_response:token},
		success: function(result){
			var captcha = JSON.parse(result);
			sessionStorage.setItem("score",captcha.score);
		},
		error: function(result,textStatus,errorThrown){
			console.log(result);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});*/
	
	document.getElementById("survey").hidden = true;
	loadRates();
	document.getElementById("endSurvey").hidden = false;
}

function addHiddenField(form, name, value) {
	var newInput = document.createElement("input");
	newInput.name = name;
	newInput.value = value;
	newInput.hidden = true;
	form.append(newInput);
}

function loadRates(){
	//document.getElementById("rates").textContent = sessionStorage.getItem("rates");
	
	var surveyTime = sessionStorage.getItem("surveyTime");
	var hours = Math.floor((surveyTime)/3600);
	var minutes = Math.floor((surveyTime)%3600/60);
	var seconds = Math.floor((surveyTime)%60);

	/*document.getElementById("survey_time").textContent = hours.toString()+':'+minutes.toString()+':'+seconds.toString();
	document.getElementById("score").textContent = sessionStorage.getItem("score");*/
	
	var form = document.getElementById("submit-form");
	addHiddenField(form, 'assignmentId', answers.assignmentId);
    	addHiddenField(form, 'workerId', answers.workerId);
	var results = {
		'id': answers.id,
		'type': answers.type,
		'rate': answers.rate
   	};
   	addHiddenField(form, 'rates', JSON.stringify(results));
	var time = hours.toString()+':'+minutes.toString()+':'+seconds.toString();
	addHiddenField(form, 'survey_time', time);
	//addHiddenField(form, 'captchaScore', sessionStorage.getItem("score"));
}

function end(){
	document.getElementById("lastQuestions").hidden = true;
	document.getElementById("Thanks").hidden = false;
}

function sendResults(){
	
	//var submitUrl = config.hitCreation.production ? MTURK_SUBMIT : SANDBOX_SUBMIT;
	if (prod == "true"){
		submitUrl =  MTURK_SUBMIT;
	} else if (prod == "false"){
		submitUrl = SANDBOX_SUBMIT;
	}
	
	/*document.getElementById("assignmentId").textContent = answers.assignmentId;
	document.getElementById("workerId").textContent = answers.workerId;
	document.getElementById("gender").textContent = document.querySelector('input[name="gender"]:checked').value;
	document.getElementById("age").textContent = document.getElementsByName('age')[0].value;
	document.getElementById("politics").textContent = document.querySelector('input[name="politics"]:checked').value;*/
	
	$("#submit-button").addClass("loading");
	
	var form = document.getElementById("submit-form");
	if (document.querySelector('input[name="gender"]:checked') != null){
		addHiddenField(form, 'gender', document.querySelector('input[name="gender"]:checked').value);
	} else {
		addHiddenField(form, 'gender', 'NA');
	}
	addHiddenField(form, 'age', document.getElementsByName('age')[0].value);
	if (document.querySelector('input[name="politics"]:checked') != null){
		addHiddenField(form, 'politics', document.querySelector('input[name="politics"]:checked').value);
	} else {
		addHiddenField(form, 'politics', 'NA');
	}
	console.log(submitUrl);
	console.log(form);
	$("#submit-form").attr("action", submitUrl); 
    	$("#submit-form").attr("method", "POST"); 
    	$("#submit-form").submit();
}

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}

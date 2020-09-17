const MTURK_SUBMIT = "https://www.mturk.com/mturk/externalSubmit";
const SANDBOX_SUBMIT = "https://workersandbox.mturk.com/mturk/externalSubmit";

var config = {};

var state = {
    taskIndex: 0,
    taskInputs: {}, 
    taskOutputs: [],
    timeOutputs:[],
    action:[],
    gender:[],
    assignmentId: gup("assignmentId"),
    workerId: gup("workerId"),
};

/* HELPERS */
function saveTaskData() {
    if (config.meta.aggregate) {
        var timestamp = Date.now();
        var times = state.timeOutputs.push(timestamp);
        var updates = custom.collectData(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
        $.extend(state.taskOutputs, updates);
    } else {
        var timestamp = Date.now();
        state.timeOutputs.push(timestamp);
        state.taskOutputs[state.taskIndex] = custom.collectData(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
        console.log('time',state.timeOutputs)
    }
}

function getTaskInputs(i) {
    return config.meta.aggregate ? state.taskInputs : state.taskInputs[i];
}

function getTaskOutputs(i) {
    return config.meta.aggregate ? state.taskOutputs : state.taskOutputs[i];
}

function updateTask() {
    custom.showTask(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
    $("#progress-bar").progress("set progress", state.taskIndex + 1);
    //if (state.taskIndex == config.meta.numSubtasks - 1) {
        
        //$("#next-button").addClass("disabled");
        /* if (state.taskIndex != 0) {
            $("#prev-button").removeClass("disabled");
        } else {
            $("#prev-button").addClass("disabled");
        } */
        //$("#submit-button").removeClass("disabled");
        //$("#final-task-fields").css("display", "flex");
        //$("#submit-button").removeClass("disabled");
        //$("#final-task-fields").css("display", "block");
        //$("#congrats").css("display", "block");
    //} 
if (state.taskIndex == 0) {
        //$("#next-button").removeClass("disabled");
        //$("#prev-button").addClass("disabled");
        $("#last").css("display", "none");
        $("#submit-button").addClass("disabled");
        $("#final-task-fields").css("display", "none");
        $("#congrats").css("display", "none");
    } else if (state.taskIndex == config.meta.numSubtasks) {
        $("#last").css("display", "flex");
        //$("#last").css("display", "block");
        $("#submit-button").removeClass("disabled"); 
        $("#final-task-fields").css("display", "flex");
        console.log($("#final-task-fields").css("display"))
        $("#experiment").css("display", "none");
    }  else {
        $("#last").css("display", "none");
        //$("#next-button").removeClass("disabled");
        //$("#prev-button").removeClass("disabled");
        $("#submit-button").addClass("disabled");
        $("#final-task-fields").css("display", "none");
        $("#congrats").css("display", "none");
    }
}

function nextTask() {
    if (state.taskIndex < config.meta.numSubtasks - 1) {
        saveTaskData();
        var err = custom.validateTask(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
        if (err) {
            generateMessage("negative", err);
        } else {
            state.action.push('next');
            state.taskIndex++;
            updateTask();
            clearMessage();
            //console.log('here');
            console.log("Current collected data", state.taskOutputs);
            console.log("time",state.timeOutputs);
            console.log("actions",state.action);
            //console.log("Inputs",state.taskInputs);
        }
    } 
     else if (state.taskIndex == config.meta.numSubtasks - 1){
         saveTaskData();
         var err = custom.validateTask(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
        if (err) {
            generateMessage("negative", err);
        } else {
            state.action.push('next');
            state.taskIndex++;
            updateTask();
            clearMessage();
            console.log(state.taskIndex);
            console.log("Current collected data", state.taskOutputs);
            console.log("time",state.timeOutputs);
            console.log("actions",state.action);
            console.log("Inputs",state.taskInputs);
        } 
     }
    else if  (state.taskIndex == config.meta.numSubtasks){
            state.action.push('next');
            updateTask();
            clearMessage();
            console.log("Current collected data", state.taskOutputs);
            console.log("time",state.timeOutputs);
            console.log("actions",state.action);
            console.log("Inputs",state.taskInputs);
        }
}       
        

function prevTask() {
    if (state.taskIndex > 0) {
        saveTaskData();
        state.taskIndex--;
        updateTask();
    }
}

function toggleInstructions() {
    //var timestamp = Date.now();
    //state.timeOutputs[state.taskIndex]=timestamp;
    if (($("#experiment").css("display") == "none")&&($("#instructions").css("display")=="flex")) {
    $("#experiment").css("display", "flex");
    $("#instructions").css("display", "none");
    $("#informed-consent").css("display","none");
    state.action.push('continue');
    saveTaskData();
    updateTask();
    }
    else if (($("#experiment").css("display") == "none")&&($("#informed-consent").css("display")=="flex")) {
        $("#informed-consent").css("display","none");
        $("#experiment").css("display", "none");
        $("#instructions").css("display", "flex");
        state.action.push('agree');
        saveTaskData();
        updateTask();
    } else {
        state.action.push('instructions');
        saveTaskData();
        $("#experiment").css("display", "none");
        $("#instructions").css("display", "flex");
    }
}

function clearMessage() {
    $("#message-field").html("");
}

function generateMessage(cls, header) {
    clearMessage();
    var messageStr = "<div class='ui message " + cls + "'>";
    messageStr += "<i class='close icon'></i>";
    messageStr += "<div class='header'>" + header + "</div></div>";

    var newMessage = $(messageStr);
    $("#message-field").append(newMessage);
    newMessage.click(function() {
        $(this).closest(".message").transition("fade");
    });
}

function addHiddenField(form, name, value) {
    // form is a jQuery object, name and value are strings
    var input = $("<input type='hidden' name='" + name + "' value=''>");
    input.val(value);
    form.append(input);
}


function submitHIT() {
    var submitUrl = config.hitCreation.production ? MTURK_SUBMIT : SANDBOX_SUBMIT;
    //console.log(submitUrl)
    //console.log(config.hitCreation.production)
    state.action.push('submit');
    state.gender.push($("#gender").val());
    saveTaskData();
    clearMessage();
    $("#submit-button").addClass("loading");
    var form = $("#submit-form");
    for (var i = 0; i < config.meta.numSubtasks; i++) {
        var err = custom.validateTask(getTaskInputs(i), i, getTaskOutputs(i));
        if (err) {
            $("#submit-button").removeClass("loading");
            generateMessage("negative", err);
            return;
        }
    }

    addHiddenField(form, 'assignmentId', state.assignmentId);
    addHiddenField(form, 'workerId', state.workerId);
    var results = {
        'inputs': state.taskInputs,
        'outputs': state.taskOutputs
    };
    addHiddenField(form, 'results', JSON.stringify(results));
    var times = {
        'time':state.timeOutputs,
        'actions':state.action
    };
    addHiddenField(form, 'times', JSON.stringify(times));
    addHiddenField(form, 'feedback', $("#feedback-input").val());
    addHiddenField(form, 'gender', state.gender);
    //download(form,'results.txt','text/plain');
    $("#submit-form").attr("action", submitUrl); 
    $("#submit-form").attr("method", "POST"); 
    $("#submit-form").submit();
    $("#submit-button").removeClass("loading");
    generateMessage("positive", "Thanks! Your task was submitted successfully.");
    $("#submit-button").addClass("disabled");
}

function gup(name) {
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var tmpURL = window.location.href;
    var results = regex.exec( tmpURL );
    if (results == null) return "";
    else return results[1];
}

/* SETUP FUNCTIONS */
function populateMetadata(config) {
    $(".meta-title").html(config.meta.title);
    $(".meta-desc").html(config.meta.description);
    $(".instructions-simple").html(config.instructions.simple);
    for (var i = 0; i < config.instructions.steps.length; i++) {
        $(".instructions-steps").append($("<li>" + config.instructions.steps[i] + "</li>"));
    }
    $(".disclaimer").html(config.meta.disclaimer);
    if (config.instructions.images.length > 0) {
        $("#sample-task").css("display", "block");
        var instructionsIndex = Math.floor(Math.random() * config.instructions.images.length);
        var imgEle = "<img class='instructions-img' src='";
        imgEle += config.instructions.images[instructionsIndex] + "'></img>";
        $("#instructions-demo").append($(imgEle));

    }
    $("#progress-bar").progress({
        total: config.meta.numSubtasks,
    });
}

function setupButtons() {
    $("#next-button").click(nextTask);
    //$("#prev-button").click(prevTask);
    //$("#prev-button").click(taskOutput="dunno");
    //$(".exp-data").text(taskInput.toString())
    //$("#prev-button").click(nextTask);
    $("#consent-button").click(toggleInstructions);
    $(".instruction-button").click(toggleInstructions);
    $("#submit-button").click(submitHIT);
    if (state.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        $("#submit-button").remove();
    }
}

/* MAIN */
$(document).ready(function() {
    $.getJSON("config.json").done(function(data) {
        config = data;
        if (config.meta.aggregate) {
            state.taskOutputs = {};
        }
        custom.loadTasks(config.meta.numSubtasks).done(function(taskInputs) {
        $.getJSON("questions.json").done(function(data) { questions=data;
            ind=config.questionNumber
            state.taskInputs = questions.config.hitCreation.number;
            populateMetadata(config);
            setupButtons(config);
        });
      });
    });
});


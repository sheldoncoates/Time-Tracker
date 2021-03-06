const fs = require('fs');

//loading drop down with projects
window.onload = function () {
  populateDropdown();
  document.getElementById("times").innerHTML = "No History";
};

function populateDropdown() {
  var select = document.getElementById("selectProject");
  document.querySelectorAll('#selectProject option').forEach(option => option.remove())
  var text = "Choose a Project";
  var element = document.createElement("option");
  element.textContent = text;
  element.value = text;
  select.appendChild(element);
  fs.readdirSync('./data/').forEach(file => {
    var opt = file;
    opt = opt.substring(0, opt.indexOf('.'));
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  });
}
function closeDropdown() {
  document.getElementById("noFill").style.visibility = "hidden";
  document.getElementById("noFill").style.opacity = 0;
  document.getElementById("created").style.visibility = "hidden";
  document.getElementById("created").style.opacity = 0;
  document.getElementById("deleted").style.visibility = "hidden";
  document.getElementById("deleted").style.opacity = 0;
}
function createProject() {
  var project = document.getElementById("proj").value;
  if (project == "") {
    document.getElementById("noFill").style.visibility = "visible";
    document.getElementById("noFill").style.opacity = 1;
    return;
  } else {
    document.getElementById("created").style.visibility = "visible";
    document.getElementById("created").style.opacity = 1;
    fs.writeFile('./data/' + project + '.csv', '', (err) => {
      if (err) {
        errorHandler(err);
        return;
      } else {
        fs.chmodSync('./data/' + project + '.csv', '0755');
        populateDropdown();
        document.getElementById("proj").value = "";
        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = true;
        document.getElementById("pause").disabled = true;
        document.getElementById("del").disabled = true;
        document.getElementById("task").disabled = true;
        document.getElementById("task").value = "";
        document.getElementById("times").innerHTML = "No History";
        document.getElementById("totalTime").innerHTML = " Total Time: 0"
      }
    });
  }

}
function deleteProject() {
  var project = document.getElementById("selectProject").value;
  fs.unlink('./data/' + project + '.csv', function (err) {
    if (err) {
      console.error(err);
    }
    populateDropdown();
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = true;
    document.getElementById("pause").disabled = true;
    document.getElementById("del").disabled = true;
    document.getElementById("task").disabled = true;
    document.getElementById("task").value = "";
    document.getElementById("times").innerHTML = "No History";
    document.getElementById("deleted").style.visibility = "visible";
    document.getElementById("deleted").style.opacity = 1;
    document.getElementById("totalTime").innerHTML = " Total Time: 0"
  });
}
//setting the project from the dropdown
var fileName = "";
function setProject(name) {
  if (name === "Choose a Project") {
    fileName = "";
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = true;
    document.getElementById("pause").disabled = true;
    document.getElementById("del").disabled = true;
    document.getElementById("task").disabled = true;
    document.getElementById("task").value = "";
    document.getElementById("times").innerHTML = "No History";
    document.getElementById("fulltime").style.display = "none";
    document.getElementById("totalTime").innerHTML = " Total Time: 0"
  } else {
    fileName = name;
    document.getElementById("del").disabled = false;
    document.getElementById("task").disabled = false;
    document.getElementById("task").value = "";
    getHistory();
  }
}
var taskName = "";
function setTask(name) {
  if (name != "" && fileName != "") {
    taskName = name;
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = false;
    document.getElementById("pause").disabled = false;
    document.getElementById("fulltime").style.display = "none";
  } else {
    taskName = "";
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = true;
    document.getElementById("pause").disabled = true;
  }
}

//getting time history of project
function getHistory() {
  document.getElementById("times").innerHTML = "";
  var headingRow = document.createElement('TR');
  var dateHeading = document.createElement('TH');
  var timeHeading = document.createElement('TH');
  var taskHeading = document.createElement('TH');
  dateHeading.appendChild(document.createTextNode("Date (YYYY - MM - DD)"));
  timeHeading.appendChild(document.createTextNode("Time (HH : MM : SS)"));
  taskHeading.appendChild(document.createTextNode("Task"));
  headingRow.appendChild(dateHeading);
  headingRow.appendChild(timeHeading);
  headingRow.appendChild(taskHeading);
  document.getElementById("times").appendChild(headingRow);
  fs.readFile('./data/' + fileName + '.csv', (err, data) => {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    if (err) throw err;
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('./data/' + fileName + '.csv')
    });

    lineReader.on('line', function (line) {
      var data = line.split(',');
      //getting the date from the csv file line
      var date = data[0];
      //getting the time from the csv file line
      var time = data[1];
      //getting the task from the csv file line
      var task = data[2];
      //splitting hours, mins and secs
      var hms = time.split(':');
      seconds += parseInt(hms[2]);
      minutes += parseInt(hms[1]);
      hours += parseInt(hms[0]);
      //can only have 60 secs
      if (seconds >= 60) {
        minutes += 1;
        seconds -= 60;
      }
      //can only have 60 mins
      if (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }
      //have to display the total time here for some reason
      document.getElementById("totalTime").innerHTML = "Total Time: " + hours + "h " + minutes + "m " + seconds + "s";

      //creating new row and items for the row
      var tr = document.createElement('TR');
      var d = document.createElement('TD');
      var t = document.createElement('TD');
      var ta = document.createElement('TD');

      //populating the row items
      d.appendChild(document.createTextNode(date));
      t.appendChild(document.createTextNode(time));
      ta.appendChild(document.createTextNode(task));
      //adding the items to the row element 
      tr.appendChild(d);
      tr.appendChild(t);
      tr.appendChild(ta);
      //adding the row to the table
      document.getElementById("times").appendChild(tr);
    });

  })
}

/* initialization of different variables 
to be used in Count-Up App*/
var clearTime;
var seconds = 0,
  minutes = 0,
  hours = 0;
var secs, mins, gethours;
var obj = {
  table: []
};

function startWatch() {
  /* check if seconds is equal to 60 and add a +1 
    to minutes, and set seconds to 0 */
  if (seconds === 60) {
    seconds = 0;
    minutes = minutes + 1;
  }

  /* i used the javascript tenary operator to format 
    how the minutes should look and add 0 to minutes if 
    less than 10 */
  mins = minutes < 10 ? "0" + minutes + ":" : minutes + ":";
  /* check if minutes is equal to 60 and add a +1 
    to hours set minutes to 0 */
  if (minutes === 60) {
    minutes = 0;
    hours = hours + 1;
  }
  /* i used the javascript tenary operator to format 
    how the hours should look and add 0 to hours if less than 10 */
  gethours = hours < 10 ? "0" + hours + ":" : hours + ":";
  secs = seconds < 10 ? "0" + seconds : seconds;

  var continueButton = document.getElementById("continue");
  continueButton.removeAttribute("hidden");

  /* display the Count-Up Timer */
  var x = document.getElementById("timer");
  x.innerHTML = gethours + mins + secs;

  /* call the seconds counter after displaying the Count-Up 
    and increment seconds by +1 to keep it counting */
  seconds++;
  /* call the setTimeout( ) to keep the Count-Up alive ! */
  clearTime = setTimeout("startWatch( )", 1000);
}
//create a function to start the Count-Up
function startTime() {
  document.getElementById("selectProject").disabled = true;
  document.getElementById("del").disabled = true;
  document.getElementById("create").disabled = true;
  document.getElementById("task").value = "";

  /* check if seconds, minutes, and hours are equal to zero 
    and start the Count-Up */
  if (seconds === 0 && minutes === 0 && hours === 0) {
    /* hide the fulltime when the Count-Up is running */
    var fulltime = document.getElementById("fulltime");
    fulltime.style.display = "none";
    var showStart = document.getElementById("start");
    showStart.style.display = "none";

    /* call the startWatch( ) function to execute the Count-Up 
        whenever the startTime( ) is triggered */
    startWatch();
  }
}
var start = document.getElementById("start");
start.addEventListener("click", startTime);

/*create a function to stop the time */
function stopTime() {
  document.getElementById("selectProject").disabled = false;
  document.getElementById("del").disabled = false;
  document.getElementById("create").disabled = false;
  document.getElementById("start").disabled = true;
  document.getElementById("stop").disabled = true;
  document.getElementById("pause").disabled = true;

  /* check if seconds, minutes and hours are not equal to 0 */
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    var continueButton = document.getElementById("continue");
    continueButton.setAttribute("hidden", "true");
    var fulltime = document.getElementById("fulltime");
    fulltime.style.display = "block";
    fulltime.style.color = "#ff4500";
    var time = gethours + mins + secs;
    fulltime.innerHTML = "Time Recorded is " + time;

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var writeData = date + ',' + time + ',' + taskName + "\n";
    // Write data in 'Time.txt' . 
    fs.appendFileSync("./data/" + fileName + '.csv', writeData, "UTF-8", { 'flags': 'a+' });

    // reset the Count-Up
    seconds = 0;
    minutes = 0;
    hours = 0;
    secs = "0" + seconds;
    mins = "0" + minutes + ":";
    gethours = "0" + hours + ":";

    /* display the Count-Up Timer after it's been stopped */
    var x = document.getElementById("timer");
    var stopTime = gethours + mins + secs;
    x.innerHTML = stopTime;

    /* display all Count-Up control buttons */
    var showStart = document.getElementById("start");
    showStart.style.display = "inline-block";
    var showStop = document.getElementById("stop");
    showStop.style.display = "inline-block";
    var showPause = document.getElementById("pause");
    showPause.style.display = "inline-block";

    /* clear the Count-Up using the setTimeout( ) 
        return value 'clearTime' as ID */
    clearTimeout(clearTime);
    getHistory();
  }
}
window.addEventListener("load", function () {
  var stop = document.getElementById("stop");
  stop.addEventListener("click", stopTime);
});
/*********** End of Stop Button Operations *********/

/*********** Pause Button Operations *********/
function pauseTime() {
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    /* display the Count-Up Timer after clicking on pause button */
    var x = document.getElementById("timer");
    var stopTime = gethours + mins + secs;
    x.innerHTML = stopTime;

    /* display all Count-Up control buttons */
    var showStop = document.getElementById("stop");
    showStop.style.display = "inline-block";

    /* clear the Count-Up using the setTimeout( ) 
        return value 'clearTime' as ID */
    clearTimeout(clearTime);
  }
}

var pause = document.getElementById("pause");
pause.addEventListener("click", pauseTime);
/*********** End of Pause Button Operations *********/

/*********** Continue Button Operations *********/
function continueTime() {
  if (seconds !== 0 || minutes !== 0 || hours !== 0) {
    /* display the Count-Up Timer after it's been paused */
    var x = document.getElementById("timer");
    var continueTime = gethours + mins + secs;
    x.innerHTML = continueTime;

    /* display all Count-Up control buttons */
    var showStop = document.getElementById("stop");
    showStop.style.display = "inline-block";
    /* clear the Count-Up using the setTimeout( ) 
        return value 'clearTime' as ID.
        call the setTimeout( ) to keep the Count-Up alive ! */
    clearTimeout(clearTime);
    clearTime = setTimeout("startWatch( )", 1000);
  }
}

window.addEventListener("load", function () {
  var cTime = document.getElementById("continue");
  cTime.addEventListener("click", continueTime);
});
/*********** End of Continue Button Operations *********/


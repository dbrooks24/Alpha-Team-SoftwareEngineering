var menu = document.getElementById("menu");
var structMenu = document.getElementById("structureList");
var canvas = document.getElementById("CanvasParent");
var header = document.getElementById("header");
const modal = document.getElementById("info-modal"); // Used for Instructions and About display
const modalBody = document.querySelector(".modal-body");
const modalCloseBtn = document.querySelector(".btn-close");
const modalTitle = document.getElementById("info-modal-label");
const dotCircle = document.getElementById("dot-circle");
const timer = document.querySelector(".timer");
let startTimeout = null;
let time = {
  ms: 0,
  sec: 0,
  min: 0
};

const instructionsHtml = [
    // Instructions section
    `<div class="container">
    <ul class="text-info margin">
        <li>Press the <b>spacebar</b>, <b>enter</b>, or <b>toggle</b> to switch between <b>Road Editing</b> and <b>Begin Simulation</b> modes.</li>
        <li>Click <b>Reset Simulation</b> to clear the entire board. </li>
        <li>Hold <b>tab</b> to display road connectivity. </li>
        <li>When in <b>Road Editing</b> mode:</li>
            <ul class="text-secondary">
                <li><b>Left-click</b> to create a new road tile.</li>
                <li>To continue building that road, <b>left-click</b> and <b>hold</b> the existing road tile and <b>drag</b><br> the mouse.</li>
                <li>To remove connectivity from one tile to another, <b>left-click</b> and <b>hold</b> the initial tile<br> and <b>drag</b> to the tile you want to disconnect from.</li>
                <li><b>Right-click</b> to remove a road tile with no connectivity.</li>
                <li><b>Right-click</b> a car to remove it.</li>
            </ul>
        <li>When in <b>Begin Simulation</b> mode:</li>
            <ul class="text-secondary">
                <li><b>Left-click</b> a road tile with connectivity to create a single car entity.</li>
                <li><b>Left-click</b> the traffic lights to toggle them.</li>
            </ul>
    </ul></div>`,
].join("<br/>");

// make the min and max SpeedInput default with current values
const configHtml = [
  `<div class="container"><ul class ="text-info margin">
        <li> Car Speeds (Randomized): </li>
        <ul class="text-secondary"><p>-Only applies to newly spawned cars-</p></ul>
        <div class="menuSlider"><div id="speedSlider"></div></div><br><br>
        <!--<li> Car Spawning Frequency: </li>-->
        <button id="applyBtn" onclick="applyChanges()">
            Apply
        </button><br>
    </ul></div>`,
].join("<br/>");

const saveUploadHtml = [
  `<div class="container"><ul class ="text-info margin">
        <li> Save Your Map: </li>
        <input type="text" name="fileName" placeholder="File Name (Optional)">
        <input type="submit" onclick="saveMap()" value="Save">
        <li> Upload a Map: </li>
        <input type="file" id="loadMap" accept="text/plain" onchange="loadMap()">
    </ul></div>`,
].join("<br/>");

const aboutHtml =
  '<div class="container"><p>A group project for Software Engineering made by Sami Al-Jailani, David Brooks, Nghia Dao, ' +
  "Jacob Butkovic, Brian Brenner, Kayla Carter, Kevin Coran, Jason Abounader, and Lorenzo Bair." +
  "</p></div>";

const creditsHtml = [
  `<div class="container"><p>
        <a href="https://github.com/leongersen/noUiSlider">noUiSlider</a><br>
        &emsp;Copyright (c) 2019 Léon Gersen<br>
        &emsp;<a href="https://github.com/leongersen/noUiSlider/blob/master/LICENSE.md" style="text-decoration: none" target="_blank">License (MIT)</a><br><br>
        <a href="https://www.vecteezy.com/vector-art/2006395-car-top-view-vector-design-illustration-set-isolated-on-white-background" target="_blank">Car Sprites</a><br>
        &emsp;<a href="https://www.vecteezy.com/free-vector/car" style="text-decoration: none" target="_blank">Car Vectors by Vecteezy</a><br><br>
        <a href="https://github.com/OpenSourceMusic/This-Nonsense-Place" target="_blank">Music</a><br>
        &emsp;Artist: Josh Penn-Pierson<br>
        &emsp;<a href="https://creativecommons.org/licenses/by/4.0/" style="text-decoration: none" target="_blank">CC-BY License</a><br><br>
    </p></div>`,
].join("<br/>");

// opens and closes menu
const btn = document.getElementById("menuIcon");
btn.addEventListener("click", () => {
  menuOpen = btn.classList.toggle("closebtn");
  if (menuOpen) {
    menu.style.width = "auto";
    menu.style.maxWidth = "200px";
    menu.classList.add("open");
  } else {
    setTimeout(function() {
      menu.style.width = "0px";
    }, "100");
  }
});

// Shows modal content depending on option selected
function showModal(name) {
  switch (name) {
    case "Instructions":
      modalTitle.innerText = name;
      modalBody.innerHTML = instructionsHtml;
      return;
    case "Config":
      modalTitle.innerText = name;
      modalBody.innerHTML = configHtml;
      showSpeedSlider();
      return;
    case "Save/Upload":
      modalTitle.innerText = name;
      modalBody.innerHTML = saveUploadHtml;
      return;
    case "About":
      modalTitle.innerText = name;
      modalBody.innerHTML = aboutHtml;
      return;
    case "Credits":
      modalTitle.innerText = name;
      modalBody.innerHTML = creditsHtml;
      return;
  }
}

function startTimer() {
  startTimeout = setTimeout(function() {
    time.ms = parseInt(time.ms);
    time.sec = parseInt(time.sec);
    time.min = parseInt(time.min);
    time.ms++;
    
    if (time.ms == 100) {
      time.sec = time.sec + 1;
      time.ms = 0;
    }
    if (time.sec == 60) {
      time.min = time.min + 1;
      time.sec = 0;
    }
    if (time.ms < 10) {
      time.ms = "0" + time.ms;
    }
    if (time.sec < 10) {
      time.sec = "0" + time.sec;
    }
    if (time.min < 10) {
      time.min = "0" + time.min;
    }
    timer.innerHTML = `${time.min}:${time.sec}`;
    
    // calling recursively
    startTimer();
  }, 10);
}
 
function resetTimer() {
  time.ms = 0;
  time.sec = 0;
  time.min = 0;
  clearTimeout(startTimeout);
  timer.innerHTML = "00:00";
}

// user can modify min and max speeds of cars
function showSpeedSlider() {
  let slider = document.getElementById("speedSlider");
  noUiSlider.create(slider, {
    //start: [4, 10],
    start: [Car.minSpeed, Car.maxSpeed],
    step: 1,
    connect: true,
    pips: {
      mode: "steps",
      density: 4,
    },
    range: {
      min: 1,
      max: 20,
    },
  });
}

// apply new min and max speeds for cars
function applyChanges() {
  let slider = document.getElementById("speedSlider");
  print(slider.noUiSlider.get()[0] + ", " + slider.noUiSlider.get()[1]);
  handleValue = slider.noUiSlider.get(true);
  Car.minSpeed = handleValue[0];
  Car.maxSpeed = handleValue[1];
}

// enable toggling between modes by clicking the toggle button
// left click on toggle button or click the spacebar
document.querySelector(".switch").addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    changeMode();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    changeMode();
  } else if (e.key === "Tab") {
    e.preventDefault();
  } // disable original TAB-key functionality for screen dimming
})

// music setup
let song;
function musicSetup() {
  soundFormats("mp3");
  song = loadSound("music/This Nonsense Place v1.0.mp3");
  song.volume(0.2);
}

window.onload = function() {
  musicSetup();
};

function toggleMusic() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
    song.play();
  }
}

// toggle between "Road Editting" and "Begin Simulation"
function toggleMode(isValid, isReset = false) {
  let initial = document.getElementById("toggle1");
  if (isValid) {
    initial.outerHTML =
      "<input id = 'toggle1' type = 'checkbox' checked disabled>";
    startTimer();
    dotCircle.classList.add("show");
  } else {
    initial.outerHTML = "<input id = 'toggle1' type = 'checkbox' disabled>";
    dotCircle.classList.remove("show");
    if (!isReset) {
      showMsg("pause");
      clearTimeout(startTimeout);
    } else {
      resetTimer();
    }
  }
}

// Given a message Id, fade-in and out the error message
let locked = false; // prevents spamming of notifications
function showMsg(msgId) {
  if (locked) {
    return;
  }
  locked = true;
  setTimeout(function() {
    locked = false; // current notification's time is done
  }, 4000);
  let message = document.getElementById(msgId);
  message.classList.remove("hide");
  setTimeout(function() {
    message.classList.add("fade-in");
    setTimeout(function() {
      message.classList.remove("fade-in");
      setTimeout(function() {
        message.classList.add("hide");
      }, 1000);
    }, 3000);
  });
}

// save current state of map as a text file
function saveMap() {
  let fileName = document.getElementsByName("fileName")[0].value + ".txt";
  if (fileName === ".txt") {
    fileName = "myMap.txt";
  } // default if no name is given
  print("SAVED AS " + fileName);

  let data = "";
  for (let i = 0; i < cols; ++i) {
    for (let j = 0; j < rows; ++j) {
      if (grid[i][j].elem === "B") {
        data += "#";
      } else if (grid[i][j].elem !== "B") {
        // Road or Structures
        for (let k = 0; k < 4; ++k) {
          let direction =
            grid[i][j].direction[Object.keys(grid[i][j].direction)[k]];
          if (direction) {
            data += "1";
          } else {
            data += "0";
          }
        }
        data += grid[i][j].elem;
      }
      if (j !== rows - 1) {
        data += "|";
      }
    }
    data += "\n";
  }

  // provide download opportunity
  const file = new Blob([data], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.setAttribute("download", fileName);
  link.href = window.URL.createObjectURL(file);
  link.click();
}

// load a given map (no error checking atm)
function loadMap() {
  const file = document.getElementById("loadMap").files[0];
  const reader = new FileReader();

  // parsing text file for character array
  let text,
    charList = [];
  reader.onload = (evt) => {
    text = evt.target.result.split("\n");
    for (let j = 0; j < text.length; ++j) {
      charList = [...charList, ...text[j].split("|")];
    }

    // clear board and copy state from given file
    let index = 0;
    resetGrid();
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        if (charList[index] !== "#") {
          grid[i][j].neighbors = getNeighbors(grid[i][j]);
          grid[i][j].updated = false;
          for (let k = 0; k < 4; ++k) {
            if (charList[index][k] !== "0") {
              grid[i][j].direction[Object.keys(grid[i][j].direction)[k]] = true;
            }
          }

          // check last char for structure placements
          grid[i][j].elem = charList[index][4];
        }
        ++index;
      }
    }
        
    // apply structures on top
    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        switch (grid[i][j].elem) {
          case "T": // traffic lights
            grid[i][j].addTrafficLightProperties();
            break;
          case "S": // car spawn
            drawStructure(grid[i][j].elem, i, j);
            break;
        }
      }
    }
  };
  reader.readAsText(file); // triggers onload function
}

// opens the menu containing structures
let structMenuOpen = false;
const structBtn = document.getElementById("structureMenu");
const structArea = document.getElementById("structContents");
structBtn.addEventListener("click", () => {
  structMenuOpen = structBtn.classList.toggle("On");
  if (structMenuOpen) {
    menuOpen = true;
    structBtn.style.width = "160px";
    structArea.style.width = "160px";
  } else {
    menuOpen = false;
    setTimeout(function() {
      structArea.style.width = "2%";
    }, "100");
    setTimeout(function() {
      structBtn.style.width = "2%";
    }, "100");
  }
});

// structure options (Op)
// Car Spawn Structure represented as 'S'
const carSpawnOp = document.getElementById("carSpawn");
carSpawnOp.addEventListener("click", () => {
  structure = "S";
  structurePicked = true;
});
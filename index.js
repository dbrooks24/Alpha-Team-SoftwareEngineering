var menu = document.getElementById("menu");
var canvas = document.getElementById("CanvasParent");
var header = document.getElementById("header");
const modal = document.getElementById("info-modal"); // Used for Instructions and About display
const modalBody = document.querySelector(".modal-body");
const modalCloseBtn = document.querySelector(".btn-close");
const modalTitle = document.getElementById("info-modal-label");
const dotCircle = document.getElementById('dot-circle');
const timer = document.querySelector('.timer');
let startTimeout = null;
let time = {
    ms: 0,
    sec: 0,
    min: 0
};

const instructionsHtml = [     // Instructions section
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
                <li>(Future) <b>Right-click</b> to toggle traffic lights.</li>
            </ul>
    </ul></div>`
].join("<br/>");

// make the min and max SpeedInput default with current values
const configHtml = [
    `<div class="container"><ul class ="text-info margin">
        <li> Vehicle Speeds (Randomized): </li>
        <ul class="text-secondary"><p>-Only applies to newly spawned cars-</p></ul>
        <div class="menuSlider"><div id="speedSlider"></div></div><br><br>
        <!--<li> Car Spawning Frequency: </li>-->
        <button id="applyBtn" onclick="applyChanges()">
            Apply
        </button><br>
    </ul></div>`
].join("<br/>");

const aboutHtml = '<div class="container"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit ' + 
 'esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>'

// opens and closes menu
const btn = document.getElementById("menuIcon");
btn.addEventListener("click", () => {
    menuOpen = btn.classList.toggle("closebtn");
    if (menuOpen) {
        menu.style.width = "110px";
        menu.classList.add('open');
    } else {
        setTimeout(function() { menu.style.width="0px"; }, "100")
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
            //print("inside" + name);
            modalTitle.innerText = name;
            modalBody.innerHTML = configHtml;
            showSpeedSlider();
            return;
        case "About":
            modalTitle.innerText = name;
            modalBody.innerHTML = aboutHtml;
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
            time.ms = '0' + time.ms;
        }
        if (time.sec < 10) {
            time.sec = '0' + time.sec;
        }
        if (time.min < 10) {
            time.min = '0' + time.min;
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
    timer.innerHTML = '00:00';
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
            mode: 'steps',
            density: 4
        },
        range: {
            'min': 1,
            'max': 20
        }
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
    if (e.button === 0) { changeMode(); }
})
window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { changeMode(); }
    else if (e.key === "Tab")   { e.preventDefault(); }     // disable original TAB-key functionality for screen dimming
})

// toggle between "Road Editting" and "Begin Simulation"
function toggleMode(isValid, isReset = false) {
    let initial = document.getElementById("toggle1");
    if (isValid) { 
        initial.outerHTML = "<input id = 'toggle1' type = 'checkbox' checked disabled>";
        startTimer();
        dotCircle.classList.add('show');
    }
    else { 
        initial.outerHTML = "<input id = 'toggle1' type = 'checkbox' disabled>";
        dotCircle.classList.remove('show');
        if (!isReset) { 
            showMsg("pause");
            clearTimeout(startTimeout);
        } else {
            resetTimer();
        }
    }
}

// Given a message Id, fade-in and out the error message
let locked = false;   // prevents spamming of notifications
function showMsg(msgId) {
    if (locked) { return; }
    locked = true;
    setTimeout(function() {
        locked = false;         // current notification's time is done
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
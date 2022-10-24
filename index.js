var menu = document.getElementById("menu");
var canvas = document.getElementById("CanvasParent");
var header = document.getElementById("header");

let opList = [  // list of current options
    `<button id = 'Instructions' class = 'option' onclick = 'showText("Instructions")'>Instructions</button>
    <button id = 'About' class = 'option' onclick = 'showText("About")'>About</button>`
].join("<br/>");

let op1 = [     // Instructions section
    `<p class="h1 text-primary margin">Instructions</p>
    <ul class="text-info margin">
        <li>Press either the <b>spacebar</b> or the <b>toggle</b> to switch between <b>Road Editting</b> and<br><b>Begin Simulation</b> modes.</li>
        <li>Click <b>Reset Simulation</b> to clear the entire board. </li>
        <li>When in <b>Road Editting</b> mode:</li>
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
    </ul>`
].join("<br/>");

let op2 = [     // About section (empty atm)
    `<p class="h1 text-primary margin">About</p>
    `
];

// opens and closes menu
const btn = document.getElementById("menuIcon");
btn.addEventListener("click", () => {
    menuOpen = btn.classList.toggle("closebtn");
    if (menuOpen) {
        menu.style.width="700px";
    } else {
        setTimeout(function() { menu.style.width="0px"; }, "100")
    }
});

// Shows text in menu depending on option selected
function showText(name) {
    switch (name) {
        case "Instructions":
            menu.innerHTML = opList + op1;
            return;
        case "About":
            menu.innerHTML = opList + op2;
            return;
    }
}

// enable toggling between modes by clicking the toggle button
// left click on toggle button or click the spacebar
document.querySelector(".switch").addEventListener("mousedown", (e) => {
    if (e.button === 0) { changeMode(); }
})
window.addEventListener("keydown", (e) => {
    if (e.key === " ") { changeMode(); }
})

// toggle between "Road Editting" and "Begin Simulation"
function toggleMode(isValid, isReset = false) {
    let initial = document.getElementById("toggle1");
    if (isValid) { initial.outerHTML = "<input id = 'toggle1' type = 'checkbox' checked disabled>"; }
    else { 
        initial.outerHTML = "<input id = 'toggle1' type = 'checkbox' disabled>";
        if (!isReset) { showMsg("pause"); }
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

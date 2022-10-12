var instructions = document.getElementById("Instructions");
var canvas = document.getElementById("CanvasParent");
var header = document.getElementById("header");
function displayMenu(){
    instructions.style.width="700px";
    instructions.style.padding="10px";
    canvas.addEventListener('click', closeMenu);
}
function closeMenu(){
    instructions.style.width="0px";
    //remove padding slightly before transition is complete
    setTimeout(function(){instructions.style.padding="0";}, "500")
    canvas.removeEventListener('click', closeMenu);
}
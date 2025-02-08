// SIDE BAR CODE
function openMode() {
    document.getElementById("sidebar").style.width = "9%";
}

function closeMode() {
   document.getElementById("sidebar").style.width = "0";
}

let modeIsClick = true;
let drawBorder = true;
let hexWorld = null;
let sea = null;

function toggleBtn(togNum) {
   if (togNum == 1) {
       if (document.getElementById("toggle1").innerHTML == "arrow_selector_tool") {
           document.getElementById("toggle1").innerHTML = "drag_pan";
           setMode('drag');
       } else {
           document.getElementById("toggle1").innerHTML = "arrow_selector_tool";
           setMode('click');
       }
   } else {
       if (document.getElementById("toggle2").innerHTML == "border_clear") {
           document.getElementById("toggle2").innerHTML = "border_outer";
           setMode('border');
       } else {
           document.getElementById("toggle2").innerHTML = "border_clear";
           setMode('noBorder');
       }
   }
   
}

function clickBtn(x){
    if (x == 1) hexWorld.generateRandom();
    if (x == 2) hexWorld.resetHexGrid();
}

// Code to control switching modes of ui system
function setMode(mode) {
    if (mode == 'drag'){
        modeIsClick = true;
    } else if (mode == 'click') {
        modeIsClick = false;
    } else if (mode == 'border') {
        drawBorder = true;
    } else if (mode == 'noBorder'){
        drawBorder = false;
    }
}

//SLIDER CODE
var slider = document.getElementById("slider");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
	output.innerHTML = this.value;
    sea.position.set(0, this.value/15, 0);
}


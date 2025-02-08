// SIDE BAR CODE
function openMode() {
    document.getElementById("sidebar").style.width = "9%";
}

function closeMode() {
   document.getElementById("sidebar").style.width = "0";
}

let modeIsClick = false;
let drawBorder = true;
let hexWorld = null;
let sea = null;
let modeSelection = 'painting';
let colorMode = 0;

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
    var landscape = document.getElementById("active1");
    var painting  = document.getElementById("active2");
    var decorate  = document.getElementById("active3");

    if (mode == 'drag'){
        modeIsClick = false;
    } else if (mode == 'click') {
        modeIsClick = true;
    } else if (mode == 'border') {
        drawBorder = true;
    } else if (mode == 'noBorder'){
        drawBorder = false;
    } else if (mode == "landscape") {
        landscape.style.color = "var(--navbar-hov)";
        painting.style.color  = "var(--navbar-icon)";
        decorate.style.color  = "var(--navbar-icon)";
        modeSelection = "landscape";
    } else if (mode == "painting") {
        landscape.style.color = "var(--navbar-icon)";
        painting.style.color  = "var(--navbar-hov)";
        decorate.style.color  = "var(--navbar-icon)";
        modeSelection = "painting";
    } else if (mode == "decorate") {
        landscape.style.color = "var(--navbar-icon)";
        painting.style.color  = "var(--navbar-icon)";
        decorate.style.color  = "var(--navbar-hov)";
        modeSelection = "decorate";
    }

    

    // Instead of display, toggle visibility so that the layout stays the same.
    var opt1 = document.getElementById("opt1");
    var opt2 = document.getElementById("opt2");
    var opt3 = document.getElementById("opt3");

    if (mode == "painting") {
        opt1.style.visibility = "visible";
        opt2.style.visibility = "visible";
        opt3.style.visibility = "visible";
        // Optional: allow interactions when visible.
        opt1.style.pointerEvents = "auto";
        opt2.style.pointerEvents = "auto";
        opt3.style.pointerEvents = "auto";
    } else if (mode == "decorate" || mode == "landscape"){
        opt1.style.visibility = "hidden";
        opt2.style.visibility = "hidden";
        opt3.style.visibility = "hidden";
        // Prevent interactions when hidden.
        opt1.style.pointerEvents = "none";
        opt2.style.pointerEvents = "none";
        opt3.style.pointerEvents = "none";
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


// DISPLAY BUTTONS
function iconSetOne() {
    var opt1 = document.getElementById("opt1");
    var opt2 = document.getElementById("opt2");
    var opt3 = document.getElementById("opt3"); 

    opt1.style.background = "var(--navbar-hov)";
    opt2.style.background = "var(--navbar-col)";
    opt3.style.background = "var(--navbar-col)";
    colorMode = 0;
}

function iconSetTwo() {
    var opt1 = document.getElementById("opt1");
    var opt2 = document.getElementById("opt2");
    var opt3 = document.getElementById("opt3"); 

    opt1.style.background = "var(--navbar-col)";
    opt2.style.background = "var(--navbar-hov)";
    opt3.style.background = "var(--navbar-col)";
    colorMode = 1;
}

function iconSetThree() {
    var opt1 = document.getElementById("opt1");
    var opt2 = document.getElementById("opt2");
    var opt3 = document.getElementById("opt3");

    opt1.style.background = "var(--navbar-col)";
    opt2.style.background = "var(--navbar-col)";
    opt3.style.background = "var(--navbar-hov)";
    colorMode = 2;
}

        


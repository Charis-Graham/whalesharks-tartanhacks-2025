// SIDE BAR CODE
function openMode() {
    document.getElementById("sidebar").style.width = "9%";
}

function closeMode() {
   document.getElementById("sidebar").style.width = "0";
}

function toggleBtn(togNum) {
   if (togNum == 1) {
       if (document.getElementById("toggle1").innerHTML == "arrow_selector_tool") {
           document.getElementById("toggle1").innerHTML = "drag_pan";
       } else {
           document.getElementById("toggle1").innerHTML = "arrow_selector_tool";
       }
   } else {
       if (document.getElementById("toggle2").innerHTML == "border_clear") {
           document.getElementById("toggle2").innerHTML = "border_outer";
       } else {
           document.getElementById("toggle2").innerHTML = "border_clear";
       }
   }
   
}

//SLIDER CODE
var slider = document.getElementById("slider");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
	output.innerHTML = this.value;
}


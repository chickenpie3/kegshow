


function setupmodal(modal_elt, close_btn) {

	// Get the modal (modal_elt)
	//var modal = document.getElementById('myModal');

	// Get the button that opens the modal (open_btn)
	//var btn = document.getElementById("myBtn");

	// Get the <span> element that closes the modal (close_btn)
	//var span = document.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal
	// open_btn.onclick = function() {
	//     modal_elt.style.display = "block";
	// }

	// When the user clicks on <span> (x), close the modal
	close_btn.onclick = function() {
	    modal_elt.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal_elt) {
	        modal_elt.style.display = "none";
	    }
	}
}
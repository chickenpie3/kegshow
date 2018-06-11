function trackscales() {
	// Create WebSocket connection.
	const socket = new WebSocket('wss://' + window.location.host + '/whatever/ws/constant');

	// Connection opened
	socket.addEventListener('open', function (event) {
	    //socket.send('Hello Server!');
	});


	let selected = document.getElementById("add_scale");
	let value = document.getElementById("add_scale_value");

	// Listen for messages
	socket.addEventListener('message', function (event) {

		let weights = JSON.parse(event.data).Weights;
		if (weights[selected.value]) {
			value.innerText = '(' + weights[selected.value].toFixed(0) + 'g)';
			value.reading = weights[selected.value];
		}

	    //console.log('Message from server ', JSON.parse(event.data).Weights['scale0']);
	});

	window.onbeforeunload = function() {
    	console.log('closing websocket');
    	socket.close();
	};
}

function deleteitem(table, id, rev) {
	console.log("deleteitem " + table + " " + id + " " + rev);

    request("DELETE", table + "?id=" + encodeURIComponent(id) + "&rev=" + encodeURIComponent(rev), null, refreshkegtable, console.log);

	//location.reload();
}

function createdeletebutton() {
	button = document.createElement('button');
	button.className = "adminbutton";
	button.innerHTML = '<img src="delete.png"></img>';

	return button;
}

function createupdatebutton(table, id) {
	button = document.createElement('button');
	button.id = "update_" + id;
	button.onclick = function(e) { updateitem(table, id); }
	button.innerHTML = '<img src="update.png"></img>';

	return button;
}

function addkeg() {
	let id = document.getElementById('add_id').value;
	let tare = Number(document.getElementById('add_scale_value').reading);

	if (!id) {
		console.log("no id!");
		return;
	}

	console.log(tare);

	if (isNaN(tare)) {
		console.log("invalid tare!")
		return;
	}

	let keg = {};
	keg.empty_weight = tare;

    request("PUT", "kegs?id=" + encodeURIComponent(id), keg, refreshkegtable, console.log);
}


function onaddscalechange(e) {
}

function refreshkegtable() {
	let table = document.getElementById('kegtable');
	let tbody = document.getElementById('kegtablebody');

	if (tbody) {
		table.removeChild(tbody);
	}

	request("GET", "kegs", null, function(kegs) {

		tbody = document.createElement('tbody');
		tbody.id = "kegtablebody"

		console.log(kegs);

		for (let keg of kegs) {
			let tr = document.createElement('tr');
			let id = document.createElement('td');
			let empty = document.createElement('td');
			let remove = document.createElement('td');

			id.innerText = keg._id;
			empty.innerText = keg.empty_weight;

			let btn = createdeletebutton();
			btn.onclick = function(e) { deleteitem('kegs', keg._id, keg._rev); };
			remove.appendChild(btn);

			tr.appendChild(id);
			tr.appendChild(empty);
			tr.appendChild(remove);

			tbody.appendChild(tr);
		}

		table.appendChild(tbody);

		if (kegs.length > 0) {
	    	table.style.display = '';
	    } else {
	    	table.style.display = 'none'
	    }

	}, console.log);
}

function populatescaletable() {

	let table = document.getElementById('scaletable');
    let select = document.getElementById('add_scale');

	request("GET", "scales", null, function(scales) {

		for(let scale of scales) {
			// Create an empty <tr> element and add it to the last position of the table:
			var row = table.insertRow(-1);
			// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
			row.insertCell(-1).innerText = scale._id;
			row.insertCell(-1).innerText = scale.offset;
			row.insertCell(-1).innerText = scale.scale_factor;
			row.insertCell(-1).innerText = scale.data_pin;
			row.insertCell(-1).innerText = scale.clock_pin;
			//row.insertCell(-1).innerHTML = createdeletebutton("equipment_scales", scale._id);

			let opt = document.createElement('option');
			opt.value = scale._id;
			opt.innerText = scale._id;
			select.appendChild(opt);
		}

		if (scales.length > 0) {
	    	table.style.display = '';
	    	trackscales();
	    } else {
	    	table.style.display = 'none';
	    }

	}, console.log);
}
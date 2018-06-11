
var apiRoot = api_base_url + window.location.pathname + "/";

function request(method, url, body, successhandler, errorhandler) {

	let req = new XMLHttpRequest();
	//req.withCredentials=true;

    if (successhandler) {
		req.addEventListener("load", function () {
			console.log(req.status)
			if (req.status == 200){
				if (req.responseText){
					successhandler(JSON.parse(req.responseText));
				} else {
					successhandler(null);
				}
			} else if (errorhandler) {
				console.log(req);
				errorhandler(req.responseText);
			}
		});
	}
	if (errorhandler) {
    	req.addEventListener("error", function() {
    		errorhandler(req.responseText);
    	});
	}

    req.open(method, apiRoot + url, true); //async=true

    if (body) {
    	req.send(JSON.stringify(body));
    } else {
    	req.send();
    }
}

function readCookie(name) {
    name += '=';
    console.log(document.cookie);
    console.log(document.cookie.split(/;\s*/));
    for (var ca = document.cookie.split(/;\s*/), i = ca.length - 1; i >= 0; i--)
        if (!ca[i].indexOf(name))
            return ca[i].replace(name, '');
}





function __request(method, url, body, successhandler, errorhandler) {

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

    req.open(method, url, true); //async=true

    if (body) {
    	req.send(JSON.stringify(body));
    } else {
    	req.send();
    }
}


function getrecipes(username, integration, callback) {


	request("GET", "recipes?api_key=6335e0726e4e2aec6ec1bc136b45c6dbe781a071&api_email=boldbrews%40gmail.com", null,
		function(data) {
			if (!data.recipes) {
				console.log('No recipes in response:' + data)
				return {};
			}

			recipes = {}

			for (var recipeindex in data.recipes) {
				recipedata = data.recipes[recipeindex].recipe

				recipes[recipedata.id] = {
					name: recipedata.title,
					style: recipedata.stylename,
					abv: recipedata.abv,
					ibu: recipedata.ibutinseth,
					srm: recipedata.srmmorey,
					og: recipedata.og,
					fg: recipedata.fg,
					snapshot: recipedata.snapshot
				};
			}

			if (callback) {
				callback(recipes);
			}


		},
		console.log)



}


function getbrewsessions(username, integration, callback) {


	request("GET", "brewsessions?api_key=6335e0726e4e2aec6ec1bc136b45c6dbe781a071&api_email=boldbrews%40gmail.com", null,
		function(data) {
			if (!data.brewsessions) {
				console.log('No brewsessions in response:' + data)
				return {};
			}

			sessions = {}

			for (var sessionindex in data.brewsessions) {
				session = data.brewsessions[sessionindex]
				sessions[session.breweventid] = {
					id:session.breweventid,
					recipe_id:session.recipeid,
					date:Date.parse(session.userdate)
				}
			}

			if (callback) {
				callback(sessions);
			}

		},
		console.log)
}
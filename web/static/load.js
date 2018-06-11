var all_recipes = null;
var all_sessions = null;
var recipe_sessions = {};

function getRemainingText(remaining_ml) {

    let pintml = 450.0;
    let pints = remaining_ml/pintml;
    return "About " + pints.toFixed(1) + " pints remaining";
}

function createactioncard(keg) {
    let inner = "";
        inner += '  <div class="card" id="fill_card_KEG_ID">';
        inner += '    <div class="kickimg" id="tap_KEG_ID">TAP ME HONEY</div>';
        inner += '  </div>';
        inner += '  <div class="card" id="kick_card_KEG_ID">';
        inner += '    <div class="kickimg" id="kick_KEG_ID">KICK ME</div>';
        inner += '  </div>';

    return inner;
}

function set_recipe_sessions() {
    for (let session_id in sessions) {
        session = sessions[session_id];
        if (recipe_sessions[session.recipe_id]) {
            recipe_sessions[session.recipe_id].push(session);
        } else {
            recipe_sessions[session.recipe_id] = [ session ];
        }
    }
}

function createrecipelist(recipes) {

    all_recipes = recipes;
    options = '';
    for (let recipe_id in recipes) {
        let snapshot = '';
        if (recipes[recipe_id].snapshot != "0" ) {
            snapshot = " (Snapshot " + recipes[recipe_id].snapshot + ")";
        }
        options += '<option value="' + recipe_id + '">' + recipes[recipe_id].name + snapshot + '</option>';
    }

    document.getElementById('taprecipe').innerHTML = options;

    if (all_sessions) {
        set_recipe_sessions();
        update_tap_date_options();
    }
}


function update_tap_date_options() {
    let recipe_id = document.getElementById('taprecipe').value;
    let sessions = recipe_sessions[recipe_id];
    let options = '';
    for (let session_index in sessions) {
        options += '<option value="' + sessions[session_index].id + '">' + sessions[session_index].date.toString('MMMM d yyyy') + '</option>';
    }

    document.getElementById('tapbrewdate').innerHTML = options;
}

function setbrewsessions(sessions) {
    all_sessions = sessions;

    if (all_recipes) {
        set_recipe_sessions();
        update_tap_date_options();
    }

}

function gettaphandler(brew) {
    return function (e) {

        if (!all_recipes) {
            getrecipes('', '', createrecipelist);
        }

        if (!all_sessions) {
            getbrewsessions('', '', setbrewsessions);
        }

        document.getElementById('tapdate').value = Date.now().toString("yyyy-MM-dd");
        document.getElementById('tapbrewdate').value = Date.now().toString("yyyy-MM-dd");

        document.getElementById('tapmodal').style.display = "block";

        document.getElementById('tapbutton').onclick = function() {
            document.getElementById('tapmodal').style.display = "none";

            recipe = all_recipes[document.getElementById('taprecipe').value]
            volume = document.getElementById('tapvolume').valueAsNumber;

            fill(brew,
                document.getElementById('tapdate').valueAsNumber/1000,
                all_sessions[document.getElementById('tapbrewdate').value].date.getTime()/1000,
                recipe,
                volume*3780);
        }
    };
}

function getkickhandler(brew) {
    return function (e) {
        document.getElementById('kickdate').value = Date.now().toString("yyyy-MM-dd");
        document.getElementById('kickmodal').style.display = "block";
        document.getElementById('kickbutton').onclick = function() {
            document.getElementById('kickmodal').style.display = "none";
            kick(brew, document.getElementById('kickdate').valueAsNumber/1000);
        }
    };
}

function addKeg(elt, keg) {

    var child = document.createElement('div');

    inner = '<div class="cardholder" ontouchstart="oncardtouchstart()" ontouchend="oncardtouchend()" onscroll="oncardscroll(event)">';
    inner += '  <div class="card" id="card_KEG_ID">';
    inner += '      <div>';
    inner += '          <div class="brewname" id="name_KEG_ID">Fill Me!</div>';
    inner += '          <div class="brewstyle" id="style_KEG_ID">Swipe left to fill</div>';
    inner += '      </div>';
    inner += '    <div class="glass" style="position: relative; width: 110px; height: 143px;">';
    inner += '       <canvas id="glass_KEG_ID" width="110" height="143" style="position: absolute; left: 0; top: 0; z-index: 0;"></canvas>';
    inner += '    </div>';
    inner += '    <div style="clear:both;"></div>';
    inner += '    <div class="stat"><div class="statname">ABV</div><div class="value" id="abv_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">IBU</div><div class="value" id="ibu_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">SRM</div><div class="value" id="srm_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">OG</div><div class="value"  id="og_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">FG</div><div class="value"  id="fg_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">Brewed</div><div class="value" id="brewdate_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div class="statname">Tapped</div><div class="value" id="kegdate_KEG_ID">N/A</div></div>';
    inner += '    <div class="stat"><div id="remaining_KEG_ID">N/A</div></div>';
    inner += '  </div>';
    inner += createactioncard(keg);
    inner += '</div>';

    inner = inner.replace(new RegExp('KEG_ID', 'g'), keg._id);

    child.innerHTML = inner;

    elt.appendChild(child.firstChild);

    updatekeg(keg);
    document.getElementById('tap_' + keg._id).onclick = gettaphandler(keg);
    document.getElementById('kick_' + keg._id).onclick = getkickhandler(keg);
    document.getElementById('taprecipe').onchange = update_tap_date_options;
}

function updatebrew(keg) {

    if (keg.recipe) {

        document.getElementById('name_'+keg._id).innerText = keg.recipe.name;
        document.getElementById('style_'+keg._id).innerText = keg.recipe.style;
        document.getElementById('style_'+keg._id).style.color = getRGBforSRM(keg.recipe.srm);
        document.getElementById('abv_'+keg._id).innerText = keg.recipe.abv;
        document.getElementById('ibu_'+keg._id).innerText = keg.recipe.ibu;
        document.getElementById('srm_'+keg._id).innerText = keg.recipe.srm;
        document.getElementById('og_'+keg._id).innerText = keg.recipe.og;
        document.getElementById('fg_'+keg._id).innerText = keg.recipe.fg;
        document.getElementById('brewdate_'+keg._id).innerText = new Date(keg.brew_date*1000).toString("MMMM d yyyy");
        document.getElementById('kegdate_'+keg._id).innerText = new Date(keg.tap_date*1000).toString("MMMM d yyyy");

        let fill = keg.remaining / keg.volume;
        renderGlass(document.getElementById('glass_'+keg._id).getContext('2d'), fill, keg.recipe.srm, 88, 121);
    } else {
        //First time
        renderGlass(document.getElementById('glass_'+keg._id).getContext('2d'), 0, 0, 88, 121);
    }
}

function updatekegaction(station) {
    if (station.kick_date || !station.recipe) {
        document.getElementById('fill_card_'+station._id).style.display = '';
        document.getElementById('kick_card_'+station._id).style.display = 'none';
        if (station.kick_date) {
            document.getElementById('remaining_'+station._id).innerText = "Kicked " + new Date(station.kick_date*1000).toString("MMMM d yyyy");
        } else {
            document.getElementById('remaining_'+station._id).innerText = "";
        }
    } else {
        document.getElementById('fill_card_'+station._id).style.display = 'none';
        document.getElementById('kick_card_'+station._id).style.display = '';
        document.getElementById('remaining_'+station._id).innerText = getRemainingText(station.remaining);
    }
}

function updateremaining(update) {

    let brew = currentbrews[update.flowmeter_id];
    let flow = (update.cumulative_flow * 1000.0) / brew.pulses_per_litre;

    if (!brew.lastremaining){
        //remember the remaining amount
        brew.lastremaining = brew.remaining;
    }

    brew.remaining = brew.lastremaining - flow;

    if (!update.flowing) {
        brew.lastremaining = brew.remaining;
    }

    let fill = brew.remaining / brew.volume;

    renderGlass(document.getElementById('glass_'+brew._id).getContext('2d'), fill, brew.recipe.srm, 88, 121);
    document.getElementById('remaining_'+brew._id).innerText = getRemainingText(brew.remaining);
}

function updatekeg(keg) {
    updatebrew(keg);
    updatekegaction(keg);
}

var currentbrews = {}

function fillcards(brews) {

        let i=0;
        for (let brew of brews) {
            brew._id = i++;
            currentbrews[brew.flowmeter_id] = brew;
            addKeg(document.getElementById("main"), brew);
        }

        console.log(currentbrews);
}
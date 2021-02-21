<template>
    <div class="card">
        
        <div class="img-container">
            <img src="../images/tap.png">
        </div>            
        
        <div class="kickdate">
            <label>Kicked on:<input type="date" :value="this.getDate()"></label>
        </div>
        <div>
            <label><input type='checkbox'>Recalibrate this keg</label>
        </div>
        <fieldset>
            <legend>New Brew</legend>
            <label for="brewsessions">Recipe:</label>
            <select name="brewsessions" id="brewsessions" v-model="selected_brew_session" @change="fetch_selected_recipe()">
                <option v-for="s in this.brew_sessions" :key="s.id" :value="s">{{s.recipe_title}}</option>
            </select>
        
            <label>Volume: <input type='number' v-model="selected_brew_volume"> us gal</label>
        
            <div class="btn" @click="fillKeg()">Replace Keg</div>
        </fieldset>
    </div>    
</template>

<script>
export default {
    name: 'kegcontrol',
    created() {
        if (!this.brew_sessions) {
            
            var self = this;
            var axios = require('axios');
            var config = {
                method: 'get',
                url: 'https://api.kegshow.com/v1/david/brewsessions',
                headers: { 
                    'X-API-KEY': '6335e0726e4e2aec6ec1bc136b45c6dbe781a071'
                }
            };

            axios(config)
            .then(function (response) {
                // console.log(JSON.stringify(response.data));
                self.brew_sessions = response.data.brewsessions;
                if (self.brew_sessions) {
                    self.selected_brew_session = self.brew_sessions[0];
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    },
    data() {
        return {
            brew_sessions : null,
            selected_brew_session : null,
            selected_brew_volume: 5
        }
    },
    props: {
      empty: { type: Boolean },
      flowmeter_id: { type: String}
    },
    methods: {
        getDate: function() {
            const dateFormat = require('dateformat');
            var date = dateFormat(new Date(), "yyyy-mm-dd");            
            console.log(date)
            return date;
        },
        fetch_selected_recipe() {

            if (this.selected_brew_session.recipe) {
                console.log("Already fetched recipe for " + this.selected_brew_session.recipe_title)
            } else {
                console.log("Fetching recipe for " + this.selected_brew_session.recipe_title)
                var self = this;
                var axios = require('axios');
                var config = {
                    method: 'get',
                    url: 'https://api.kegshow.com/v1/david/recipes/' + self.selected_brew_session.recipeid,
                    headers: { 
                        'X-API-KEY': '6335e0726e4e2aec6ec1bc136b45c6dbe781a071'
                    }
                };
                axios(config)
                .then(function (response) {
                    console.log(response.data.recipes[0]);
                    self.selected_brew_session.recipe = response.data.recipes[0];
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
        },
        fillKeg() {
            var bf_recipe = this.selected_brew_session.recipe;

            var ks_recipe = {
                name: bf_recipe.title,
                style: bf_recipe.stylename,
                abv: bf_recipe.abv,
                ibu: bf_recipe.ibutinseth,
                srm: bf_recipe.srmmorey,
                og: bf_recipe.og,
                fg: bf_recipe.fg,
                snapshot: bf_recipe.snapshot
            }
            
            console.log(ks_recipe);

            var self = this;
            var axios = require('axios');
            // var config = {
            //     method: 'post',
            //     url: 'https://api.kegshow.com/v1/david/brew',
            //     body: {
            //         flowmeter_id: self.flowmeter_id,
            //         volume: self.selected_brew_volume * 3785,
            //         remaining: self.selected_brew_volume,
            //         kick_date: 0,
            //         tap_date: new Date(),
            //         brew_date: self.selected_brew_session.created_at,
            //         recipe: JSON.stringify(ks_recipe)}
            // };


            var new_brew = {
                    flowmeter_id: self.flowmeter_id,
                    volume: self.selected_brew_volume * 3785,
                    remaining: self.selected_brew_volume * 3785,
                    kick_date: 0,
                    tap_date: new Date().getTime() / 1000,
                    brew_date: new Date(self.selected_brew_session.created_at).getTime() / 1000,
                    recipe: JSON.stringify(ks_recipe)};

            axios.post('https://api.kegshow.com/v1/david/brew', new_brew)
            .then(function (response) {                
                console.log(response);
                new_brew.recipe = ks_recipe;
                console.log(new_brew);
                self.$emit('keg-refilled', new_brew);
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
}
</script>

<style scoped>
 
input, select {
    height: 24px;
    border-left-style: none;
    border-top-style: none;
    border-right-style: none;
    border-bottom-style: ridge;
    border-bottom-width: thin;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
}

input[type=checkbox], input[type=radio] {
  vertical-align: middle;
  position: relative;
  bottom: 1px;
}

input[type=number] {
    max-width: 30px;
}
input:focus, select:focus {
    outline: none;
}

label {
    margin: 5px;
}

img {
    width: 60%;
    /* max-height: 180px; */
}

.img-container {
    text-align: center;
    margin: 5px;
}

.card label {
    margin-left: 5px;
    /* margin-right: 15px;
    vertical-align: bottom; */
}

.btn {
    display: inline-block;
    background: lightgray;
    border-color: gray;
    border-style: solid;
    border-radius: 3px;
    text-align: center;
    padding: 5px 20px;
    margin: 20px 0px;
}

.btn:hover {
    background: gray;
    border-color: lightgray;
    border-radius: 3px;
    cursor: pointer;
}

.btn:active {
    background: white;
    border-color: black;
    border-radius: 3px;    
}


</style>
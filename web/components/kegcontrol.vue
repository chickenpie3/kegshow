<template>
    <div>

        <!-- <div class="kickdate">
            <label>Kicked on:<input type="date" :value="this.getDate()"></label>
        </div>
        <div>
            <label><input type='checkbox'>Recalibrate this keg</label>
        </div> -->
        <div class="section-title">New Keg</div>

        <label for="brewsessions">Recipe:</label>
        <select name="brewsessions" id="brewsessions" v-model="selected_brew_session" @change="fetch_selected_recipe()">
            <option v-for="s in this.brew_sessions" :key="s.id" :value="s">{{s.recipe_title}}</option>
        </select>

        <label>Volume: <input type='number' v-model="selected_brew_volume"> us gal</label>
        <div class="btn" @click="fillKeg()">Replace</div>

        <div class="section-title">Calibration</div>
        Current: {{this.brew.pulses_per_litre}} pulses per liter <br /><br />
        <label>Pulses: {{pulses}}</label><br />
        <label>Volume: <input type="number" value="0" :disabled="!calibration_started" />ml</label>
        <div class="btn" @click="calibrate()">{{ calibration_started ? 'Calibrate' : 'Start' }}</div>

        <!-- <div class="section-title">Empty Keg</div>
        <label>Kicked on:<input type="date" :value="this.getDate()"></label>
        <div class="btn" @click="emptyKeg()">Empty</div>
        -->

        <div class="section-title"></div>
        <div class="btn" @click="$emit('close')">Exit</div>
        <div class="section-title"></div>

    </div>
</template>

<script>
export default {
    name: 'kegcontrol',
    props: {
      brew_sessions : { type: Array },
      brew: { type: Object },
      flowmeter_id: { type: String }
    },
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
        } else {
            this.selected_brew_session = this.brew_sessions[0];
        }
        this.fetch_selected_recipe();
    },
    data() {
        return {
            empty: this.brew == null,
            selected_brew_session : null,
            selected_brew_volume: 5,
            calibration_started: false,
            initial_pulses: 0,
            pulses: 0
        }
    },
    watch: {
      'brew_sessions': function(newVal, oldVal) {
        console.log('Prop changed: ', newVal, ' | was: ', oldVal)
        if (newVal) {
          this.selected_brew_session = newVal[0];
        }
      },
      'brew.pulses': function(newVal, oldVal) {
        if (this.calibration_started) {
          console.log(`brew.pulses ${oldVal} -> ${newVal}`);
          this.pulses = newVal - this.initial_pulses;
        }
      }
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
                recipe: JSON.stringify(ks_recipe)
            };

            axios.post('https://api.kegshow.com/v1/david/brew', new_brew)
            .then(function (response) {
                console.log(response);
                new_brew.recipe = ks_recipe;
                console.log(new_brew);
                self.$emit('keg-refilled', new_brew);
                self.$emit('close');
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        emptyKeg() {

        },
        calibrate() {
            if (this.calibration_started) {
                console.log("Calibrating");
            } else {
                console.log("Starting Calibration");
                let self = this;
                this.calibration_started = true;
                var axios = require('axios');
                var config = {
                    method: 'post',
                    url: `https://api.kegshow.com/v1/${this.$route.params.user}/calibrate`,
                    headers: {
                        'X-API-KEY': '6335e0726e4e2aec6ec1bc136b45c6dbe781a071'
                    },
                    data: { flowmeter_id: this.brew.flowmeter_id }
                };
                axios(config)
                .then(function (response) {
                    console.log(response);
                    self.initial_pulses = self.brew.pulses;
                })
                .catch(function (error) {
                    console.log(error);
                    self.calibration_started = false;
                });
            }
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
    margin-left: 5px;
}

input[type=checkbox], input[type=radio] {
  vertical-align: middle;
  position: relative;
  bottom: 1px;
}

input[type=number] {
    max-width: 60px;
    min-width: 60px;
}

input:focus, select:focus {
    outline: none;
}
/*
label {
    margin: 5px;
} */

.section-title {
    margin-top: 25px;
    margin-bottom: 5px;
    font-weight: bold;
    line-height: 150%;
    clear: both;
}

.btn {
    /* display: inline-block; */
    background: lightgray;
    border-color: gray;
    border-style: solid;
    border-radius: 3px;
    text-align: center;
    padding: 5px 20px;
    margin: 20px 0px;
    float: right;
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
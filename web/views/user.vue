<template>
  <div>
    <div v-for='b in brews' :key='b.flowmeter_id'>
      <card :brew="b" :brew_sessions="brew_sessions"></card>
    </div>
  </div>
</template>


<script>
import card from '../components/card.vue'
import monitor from '../static/monitor.js'

function flowmessage(msg) {
  let brew = this.brews[msg.flowmeter_id];
  let flow = (msg.cumulative_flow * 1000.0) / brew.pulses_per_litre;

  if (!brew.remaining_at_start_of_flow){
      //remember the remaining amount
      brew.remaining_at_start_of_flow = brew.remaining;
  }

  brew.remaining = brew.remaining_at_start_of_flow - flow;

  if (!msg.flowing) {
      brew.remaining_at_start_of_flow = brew.remaining;
  }

  console.log("remaining " + brew.remaining);
}


export default {
  created() {
    const axios = require('axios').default;
    var api_base_url = "https://api.kegshow.com/v1/" + this.$route.params.user;
    var self = this;
    axios.get(api_base_url + "/brew", )
      .then(function (response) {
        // handle success
        var bs = {}
        console.log(response);
        for (let b of response.data.brews) {
          bs[b.flowmeter_id]=b;
        }
        self.brews = bs;
        monitor(response.data.devices, self.flowmessage);
      })

    var axios2 = require('axios');
    var config = {
        method: 'get',
        url: api_base_url + '/brewsessions',
        headers: {
            'X-API-KEY': '6335e0726e4e2aec6ec1bc136b45c6dbe781a071'
        }
    };

    axios2(config)
    .then(function (response) {
        // console.log(JSON.stringify(response.data));
        self.brew_sessions = response.data.brewsessions;
    })
    .catch(function (error) {
        console.log(error);
    });

  },
  data() {
    return {
      brews: {},
      brew_sessions: []
    }
  },
  components: {
    card
  },
  methods: {
    flowmessage
  }

}
</script>
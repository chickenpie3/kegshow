<template>

  <!-- <swiper ref="mySwiper" class="swiper" :slides-per-view="1" :space-between="0" :no-swiping="true"> -->
    <!-- <swiper-slide class="card-slide"> -->
      <div class="card" id="card_KEG_ID">
        <div class="cardrow" style="height:130px;">
            <div class="brewname" id="name_KEG_ID">{{this.brew.recipe.name}}</div>
            <div class="brewstyle" id="style_KEG_ID" :style="'color:' + brew_color">{{this.brew.recipe.style}}</div>
        </div>
        <div class="cardrow">
          <div style="display: inline-block">
            <div class="stat"><div class="statname">ABV</div><div class="value" id="abv_KEG_ID">{{this.brew.recipe.abv}}</div></div>
            <div class="stat"><div class="statname">IBU</div><div class="value" id="ibu_KEG_ID">{{this.brew.recipe.ibu}}</div></div>
            <div class="stat"><div class="statname">SRM</div><div class="value" id="srm_KEG_ID">{{this.brew.recipe.srm}}</div></div>
            <div class="stat"><div class="statname">OG</div><div class="value"  id="og_KEG_ID">{{this.brew.recipe.og}}</div></div>
            <div class="stat"><div class="statname">FG</div><div class="value"  id="fg_KEG_ID">{{this.brew.recipe.fg}}</div></div>
          </div>
          <!-- @click="animate" -->
          <div class="glass" @click="showModal = true" style="grid-column: 2; position: relative; width: 110px; height: 143px;">
            <Glass :id="brew.flowmeter_id.replace('/', '')" :fill="brew.remaining/brew.volume" :color="brew_color" :design="glass_style" style="width: 110px; height 140px"></Glass>
          </div>
        </div>

        <div class="stat cardrow"><div class="statname">Brewed</div><div class="value" id="brewdate_KEG_ID">{{this.brew_date}}</div></div>
        <div class="stat cardrow"><div class="statname">Tapped</div><div class="value" id="kegdate_KEG_ID">{{this.tap_date}}</div></div>
        <div class="stat cardrow"><div id="remaining_KEG_ID">{{this.keg_remaining}}</div></div>
      <div class="cardrow">
        <div ref="chartDiv"

         style="margin: 17px 0px 0px 0px;" v-if="flow_history.length>1">
          <GChart ref="chart" type="AreaChart" :data="flow_history" :options="chartOptions" :events="{'ready': on_ready}"></GChart>
        </div>
        <div class="firstdate">{{this.firstDate}}</div>
        <div class="lastdate">{{this.lastDate}}</div>
      </div>

      <Teleport to="body">
        <!-- use the modal component, pass in the prop -->
        <modal :show="showModal">
          <template #body>
            <kegcontrol :brew="brew" :brew_sessions="brew_sessions" :flowmeter_id="brew.flowmeter_id" v-on:keg-refilled="keg_refilled($event)" @close="showModal = false"></kegcontrol>
          </template>
        </modal>
      </Teleport>

      </div>
    <!-- </swiper-slide> -->
    <!-- <swiper-slide class="swiper-slide"> -->
      <!-- <kegcontrol :empty="this.brew == null" :brew_sessions="this.brew_sessions" :flowmeter_id="this.brew.flowmeter_id" v-on:keg-refilled="keg_refilled($event)"></kegcontrol> -->
    <!-- </swiper-slide> -->
  <!-- </swiper> -->



</template>


<script>

import kegcontrol from './kegcontrol.vue';

//Initialize swiper
// import { Swiper, SwiperSlide} from 'vue-awesome-swiper'
// import style (>= Swiper 6.x)
// import 'swiper/swiper-bundle.css'

import { GChart } from 'vue-google-charts'

import Modal from './modal.vue'
import Glass from './glass.vue'
import { rgb_for_srm } from './srm'

function getChartTooltip(date, remaining_ml) {
  var remaining = (remaining_ml/450.0).toFixed(1);
  return formatChartDate(date) + "\n" + remaining + " pints remaining";
}

function formatChartDate(date) {
  const dateFormat = require('dateformat');
  const thisYear = new Date().getFullYear();
  return thisYear == date.getFullYear() ? dateFormat(date, "mmmm dS") : dateFormat(date, "mmmm dS yyyy");
}

export default {
    name: 'card',
    mounted () {
      this.update_history();
    },
    props: {
      brew: { type: Object },
      brew_sessions: { type: Array }
    },
    data: function () {
      return {
        'flow_history': [],
        firstDate: '',
        lastDate: '',
        showModal: false
        };
    },
    // watch: {
    //   'brew.remaining': function(newVal, oldVal) {
    //     console.log('Prop changed: ', newVal, ' | was: ', oldVal)
    //     if (newVal != oldVal) {
    //       if (newVal < 0) {
    //         newVal = 0;
    //       }
    //       var now = new Date();
    //       this.flow_history.push([now, newVal, getChartTooltip(now, newVal)])
    //       this.lastDate = formatChartDate(now);
    //       var volume = this.brew.volume;
    //       var srm = this.brew.recipe.srm;
    //       var ctx = this.$refs['glass-canvas'].getContext('2d');
    //       requestAnimationFrame(function() {
    //         ctx.clearRect(0, 0, 110, 143)
    //         renderGlass(ctx, newVal/volume, srm, 88, 121)
    //       });
    //     }
    //   }
    // },
    computed: {
      brew_color: function() {
        return rgb_for_srm(parseFloat(this.brew.recipe.srm));
      },
      brew_date: function() {
        const dateFormat = require('dateformat');
        return dateFormat(new Date(this.brew.brew_date*1000), "mmmm dS yyyy");
      },
      tap_date: function() {
        const dateFormat = require('dateformat');
        return dateFormat(new Date(this.brew.tap_date*1000), "mmmm dS yyyy");
      },
      keg_remaining: function() {
        if (this.brew.remaining <= 0) {
          return "Empty"
        }
        var pintml = 450.0;
        var pints = this.brew.remaining/pintml;
        return "About " + pints.toFixed(1) + " pints remaining";
      },
      chartOptions: function() {
        return {
          chartArea: {left:0,top:0,width:'100%',height:'100%'},
          colors: [this.brew_color],
          lineWidth: 1,
          hAxis: {
            gridlines: {
              count: 0,
              color: 'transparent'
            },
            ticks: [this.flow_history[1][0], this.flow_history[this.flow_history.length - 1][0]]
          },
          vAxis: {
            textPosition: 'none',
            gridlines: {
              count: 0,
              color: 'transparent'
            },
            baseline: 0,
            baselineColor: 'transparent'
          },
          legend: {position: 'none'},
          animation: {
            startup: true,
            duration: 500,
            easing: 'out'
          },
          crosshair: {
            trigger: 'focus',
            orientation: 'vertical'
          },
          explorer: {
            keepInBounds: true,
            maxZoomIn: 0.01,
            zoomDelta: 1.1,
            axis: 'horizontal'
          }
        }
      },
      glass_style: function() {
        const style = this.brew.recipe.style.toLowerCase();
        if (style.includes("ipa")) {
          return 'ipa';
        }
        if (style.includes("belgian")) {
          return 'tulip';
        }
        if (style.includes("irish")) {
          return 'irish';
        }
        if (style.includes("pils")) {
          return 'pilsner';
        }
        if (style.includes('witbier')) {
          return 'weizen';
        }
        if (style.includes("american")) {
          return 'american';
        }
        return 'nonic';
        //willibecher
      }
    },
    methods: {
      update_history: function() {
        const axios = require('axios').default;
        var api_base_url = "https://api.kegshow.com/v1/" + this.$route.params.user;
        var self = this;
        axios.get(api_base_url + "/flowhistory?flowmeter_id=" + this.brew.flowmeter_id)
        .then(function (response) {
          if (response.data.flow_history.length > 0) {

            let lastDate = new Date(response['data']['flow_history'][0][0]+'Z');
            self.firstDate = formatChartDate(lastDate);
            let lastRemaining = response['data']['flow_history'][0][1];
            const formatted = [['Date', 'Remaining', {role: 'tooltip'}]];

            const timeSpan = new Date(response['data']['flow_history'][response['data']['flow_history'].length - 1][0]+'Z') - lastDate;
            const msPerPx = timeSpan/350.0;
            const maxPxForLine = 5;
            const maxMsForLine = msPerPx * maxPxForLine;
            console.log("max mins for line: " + maxMsForLine/60000);

            for (let datapoint of response['data']['flow_history']) {
              const date = new Date(datapoint[0]+"Z");
              const remaining = datapoint[1] < 0 ? 0 : datapoint[1];
              if (date - lastDate > maxMsForLine) {
                const justBefore = new Date(date.getTime()-1);
                formatted.push([justBefore, lastRemaining, getChartTooltip(justBefore, lastRemaining)])
              }
              formatted.push([date, remaining, getChartTooltip(date, remaining)])
              lastDate = date;
              lastRemaining = remaining;
            }
            self.lastDate = formatChartDate(lastDate);
            self.flow_history = formatted;
          }
        })
      },
      keg_refilled: function(new_brew) {
        this.brew = new_brew;
        this.update_history();
      },
      animate: function() {
        let self = this;
        this.intervalId = setInterval(() => {
          if (self.brew.remaining <= 0 ) {
            clearInterval(self.intervalId);
          } else {
            self.brew.remaining = self.brew.remaining - 30.0;
          }
          console.log(this.brew.remaining)
        }, 100);
      },
      update_graph_range() {
        const c = this.$refs['chart'].chartObject;
        const chartLayout = c.getChartLayoutInterface();
        const chartBounds = chartLayout.getChartAreaBoundingBox();
        const minValue = chartLayout.getHAxisValue(chartBounds.left);
        const maxValue = chartLayout.getHAxisValue(chartBounds.left + chartBounds.width);
        this.firstDate = formatChartDate(minValue);
        this.lastDate = formatChartDate(maxValue);
      },
      on_ready() {
        if (!this.graph_observer) {
          const self = this;
          const observer = new MutationObserver(function (/*mutations*/) {
            self.update_graph_range();
          });
          observer.observe(this.$refs['chartDiv'], {
            childList: true,
            subtree: true
          });
          this.graph_observer = observer;
        }
        console.log("ready");
      }
    },
    components: {
      kegcontrol,
      // Swiper,
      // SwiperSlide,
      GChart,
      Modal,
      Glass
    }
}
</script>

<style scoped>

.swiper {
  width: 380px;
  margin: 15px;
}

.cardrow {
  display: table-row;
}

.card {
    background-color: #FFFFFF;
    padding: 15px;
    width: 350px;
    flex-shrink: 0;
    display: table;
}

.brewname {
    clear: left;
    color: black;
    font-weight: 700;
    font-size: 24pt;
}

.brewstyle {
    clear: left;
    color: black;
    font-weight: 400;
    font-size: 20pt;
    margin-top: -5px;
    margin-bottom:30px;
}

.stat{
    clear: left;
}

.statname {
  float: left;
  min-width: 45px;
}

.value {
    float: left;
    margin-left: 5px;
}

.glass {
    margin-left: 130px;
    float: right;
}

.firstdate {
  float: left;
  font-size: small;
}

.lastdate {
  float: right;
  font-size: small;
}

</style>
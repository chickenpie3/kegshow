<template>

  <swiper ref="mySwiper" class="swiper" :slides-per-view="1" :space-between="0">
    <swiper-slide class="card-slide">
      <div class="card" id="card_KEG_ID">
        <div>
            <div class="brewname" id="name_KEG_ID">{{this.brew.recipe.name}}</div>
            <div class="brewstyle" id="style_KEG_ID" :style="'color:' + getRGBforSRM(this.brew.recipe.srm)">{{this.brew.recipe.style}}</div>
        </div>
        <div style="display: grid">
          <div style="display: inline-block">
            <div class="stat"><div class="statname">ABV</div><div class="value" id="abv_KEG_ID">{{this.brew.recipe.abv}}</div></div>
            <div class="stat"><div class="statname">IBU</div><div class="value" id="ibu_KEG_ID">{{this.brew.recipe.ibu}}</div></div>
            <div class="stat"><div class="statname">SRM</div><div class="value" id="srm_KEG_ID">{{this.brew.recipe.srm}}</div></div>
            <div class="stat"><div class="statname">OG</div><div class="value"  id="og_KEG_ID">{{this.brew.recipe.og}}</div></div>
            <div class="stat"><div class="statname">FG</div><div class="value"  id="fg_KEG_ID">{{this.brew.recipe.fg}}</div></div>
          </div>
          <div class="glass" style="grid-column: 2; position: relative; width: 110px; height: 143px;">
            <canvas ref='glass-canvas' id="glass_KEG_ID" width="110" height="143" style="position: absolute; left: 0; top: 0; z-index: 0;"></canvas>
          </div>
        </div>
        
        <div class="stat"><div class="statname">Brewed</div><div class="value" id="brewdate_KEG_ID">{{this.brew_date}}</div></div>
        <div class="stat"><div class="statname">Tapped</div><div class="value" id="kegdate_KEG_ID">{{this.tap_date}}</div></div>
        <div class="stat"><div id="remaining_KEG_ID">{{this.keg_remaining}}</div></div>
      </div>
    </swiper-slide>
    <swiper-slide class="swiper-slide">
      <kegcontrol :empty="this.brew == null" :brew_sessions="this.brew_sessions" :flowmeter_id="this.brew.flowmeter_id" v-on:keg-refilled="keg_refilled($event)"></kegcontrol>
    </swiper-slide>    
  </swiper>


</template>


<script>

import kegcontrol from '../components/kegcontrol.vue';

//Initialize swiper
import { Swiper, SwiperSlide} from 'vue-awesome-swiper'
// import style (>= Swiper 6.x)
import 'swiper/swiper-bundle.css'

var srm_rgb_values = {
0: [249, 235, 190],  1:[241, 210, 128],
2: [231, 165,  53],  3:[217, 133,  21],
4: [203, 105,   6],  5:[189,  85,   0],
6: [175,  68,   0],  7:[161,  54,   0],
8: [148,  42,   0],  9:[135,  35,   0],
10:[126,  28,   0], 11:[114,  22,   0],
12:[104,  19,  19], 13:[ 96,  14,   0],
14:[ 87,  10,   0], 15:[ 79,   9,   1],
16:[ 73,   6,   0], 17:[ 67,   6,   1],
18:[ 62,   4,   0], 19:[ 57,   3,   1],
20:[ 51,   1,   0], 21:[ 47,   2,   0],
22:[ 42,   1,   0], 23:[ 39,   1,   0],
24:[ 36,   0,   0], 25:[ 32,   1,   0],
26:[ 30,   0,   0], 27:[ 28,   0,   0],
28:[ 24,   0,   0], 29:[ 22,   1,   0],
30:[ 20,   0,   0]
}

function getRGBforSRM_imp(srm) {

    var srm_min = 0
    var srm_max = 30

    var rgb = srm_rgb_values[srm_min]

    if (srm >= srm_max) {
        rgb = srm_rgb_values[srm_max];
    } else if (srm > srm_min) {
        var srm_low = Math.floor(srm)
        var srm_lambda = srm - srm_low
        var srm_high = srm_low + 1;

        rgb[0] = srm_rgb_values[srm_low][ 0] + srm_lambda * (srm_rgb_values[srm_high][ 0] - srm_rgb_values[srm_low][ 0])
        rgb[1] = srm_rgb_values[srm_low][1] + srm_lambda * (srm_rgb_values[srm_high][1] - srm_rgb_values[srm_low][1])
        rgb[2] = srm_rgb_values[srm_low][2] + srm_lambda * (srm_rgb_values[srm_high][2] - srm_rgb_values[srm_low][2])
    }

    //console.log('rgb(' + rgb[ 0] + ', ' + rgb[1] + ", " + rgb[2]+')')
    return 'rgb(' + Math.round(rgb[ 0]) + ', ' + Math.round(rgb[1]) + ", " + Math.round(rgb[2])+ ')'
}

function createGlassGradient(ctx, width) {
  var glassGradient = ctx.createLinearGradient(0,0,width,0);
	glassGradient.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
	glassGradient.addColorStop(0.22, 'rgba(127, 127, 127, 0.15)');
	glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
	glassGradient.addColorStop(0.60, 'rgba(255, 255, 255, 0)');
	glassGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
  glassGradient.addColorStop(1, 'rgba(0, 0, 0, 0.50)');
  return glassGradient;
}

function renderTulip(ctx, fill, srm, width, height) {

   
  ctx.save();
  ctx.translate(2,2);

  
  function drawContour() {
    ctx.save();
    ctx.scale(0.2, 0.2);

    ctx.beginPath();
    ctx.moveTo(48.458, 0);
    ctx.bezierCurveTo(48.251, 3.911, 47.640, 14.009, 47.102, 25.272);
    ctx.bezierCurveTo(44.224, 85.438,40.839, 110.321,30.802, 145.098);
    ctx.bezierCurveTo(10.597, 215.105,1.452, 260.028,1.530, 288.889);
    ctx.bezierCurveTo(1.782, 382.155,51.003, 453.011,141.447, 490.309);
    ctx.lineTo(151.739, 494.553, 157.777, 506.754);
    ctx.bezierCurveTo(170.125, 531.703,175.406, 556.229,171.138, 568.801);
    ctx.bezierCurveTo(165.403, 585.692,140.965, 605.155,110.066, 617.439);
    ctx.bezierCurveTo(55.282, 639.221,32.306, 662.872,53.020, 676.164);
    ctx.bezierCurveTo(87.970, 698.591,296.434, 700.409,343.587, 678.697);
    ctx.bezierCurveTo(371.047, 666.053,350.577, 641.037,294.553, 618.774);
    ctx.bezierCurveTo(263.757, 606.536,240.093, 589.185,232.160, 573.026);
    ctx.bezierCurveTo(225.255, 558.960,229.591, 534.225,243.908, 506.018);  
    ctx.lineTo(249.673, 494.659, 261.002, 489.772);
    ctx.bezierCurveTo(333.870, 458.344,377.691, 409.755,393.837, 342.484);
    ctx.bezierCurveTo(405.759, 292.809,400.916, 251.480,370.803, 145.933);
    ctx.bezierCurveTo(359.960, 107.928,357.799, 91.276,353.306, 11.111);
    ctx.lineTo(352.732, 0.871, 200.784, 0.871);
    ctx.closePath();
    ctx.restore();
  }

  drawContour();

  ctx.clip();
  
  // ctx.save();
  
  ctx.fillStyle = 'rgb(190,190,200)';
  ctx.fill();
  
  // ctx.restore();
  if (fill < 0) {
    fill = 0;
  } else if (fill > 1) {
    fill = 1;
  }

  var stemHeight = 23;
  height = height - stemHeight;

  var head = fill * 25;
  var h1y = height * (1-fill);
  var h2y = h1y + head;
  
  ctx.fillStyle = getRGBforSRM_imp(srm);
  ctx.beginPath();
  ctx.arc(40, 40, 60, 1.3, Math.PI-1.3);
  ctx.fill();

	ctx.fillRect(0, h2y, width, height - h2y);
  
  ctx.fillStyle = 'rgb(255, 254, 242)';
  ctx.fillRect(0, h1y, width, head);

  ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 4;
	ctx.fillStyle = createGlassGradient(ctx, width);
	ctx.strokeStyle = createGlassGradient(ctx, width);
  drawContour();
  ctx.fill();
  ctx.stroke();

  ctx.restore()
}

function renderGlass(destctx, fill, srm, width, height) {
  var tulip = false;
  if (tulip) {
    renderTulip(destctx, fill, srm, width, height);
  } else {
    renderStraightGlass(destctx, fill, srm, width, height);
  }
}

function renderStraightGlass(destctx, fill, srm, width, height) {

  console.log("Rendering glass")

	//let ctx = offscreenCanvas.getContext('2d');
	let ctx = destctx;

	//var f = fill;
    //fill = (fill + 114000.0)/1000.0;

    if (fill < 0) {
      fill = 0;
    } else if (fill >1) {
      fill = 1;
    }

	//var height = 121;
	var topWidth = width; //88
	var slope = 13.0/121.0; // (topWidth/2 - bottomWidth/2) / height;
	var bottomWidth = topWidth - (slope * height)*2;// 62;
	var offset = (topWidth - bottomWidth) / 2;
	var head = fill * height * 0.15;
	var h1x = offset * (1-fill);
	var h1y = height * (1-fill);
	var h2x = slope * (head) + h1x;
	var h2y = h1y + head;
	var b1x = h2x;
	var b1y = h2y;
	var b2x = offset;
	var b2y = height;

    ctx.save();
	ctx.translate(2,2);

	//glass background
	ctx.beginPath();
	ctx.fillStyle = 'rgb(190,190,200)';
	ctx.moveTo(0, 0);
	ctx.lineTo(offset, height);
	ctx.lineTo(offset + bottomWidth, height);
	ctx.lineTo(topWidth, 0);
	ctx.closePath();
	ctx.fill();

	// head
	ctx.beginPath();
	ctx.fillStyle = 'rgb(255, 254, 242)';
	ctx.moveTo(h1x, h1y);
	ctx.lineTo(h2x, h2y);
	ctx.lineTo(topWidth - h2x, h2y);
	ctx.lineTo(topWidth - h1x, h1y);
	ctx.closePath();
	ctx.fill();

  // beer
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 4;
	ctx.fillStyle = getRGBforSRM_imp(srm);
	ctx.moveTo(b1x, b1y);
	ctx.lineTo(b2x, b2y);
	ctx.lineTo(topWidth - b2x, b2y);
	ctx.lineTo(topWidth - b1x, b1y);
	ctx.closePath();
	ctx.fill();

	//gradient
	var glassGradient = ctx.createLinearGradient(0,0,topWidth,0);
	glassGradient.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
	glassGradient.addColorStop(0.22, 'rgba(127, 127, 127, 0.15)');
	glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
	glassGradient.addColorStop(0.60, 'rgba(255, 255, 255, 0)');
	glassGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
	glassGradient.addColorStop(1, 'rgba(0, 0, 0, 0.50)');

  // Outer glass
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.miterLimit = 4;
	ctx.lineWidth = 2;
	ctx.fillStyle = glassGradient;
	ctx.strokeStyle = glassGradient;
	ctx.moveTo(0, 0);
	ctx.lineTo((topWidth-bottomWidth)/2, height);
	ctx.lineTo((topWidth-bottomWidth)/2 +bottomWidth, height);
	ctx.lineTo(topWidth, 0);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

    //glass outline
    // ctx.beginPath();
	// ctx.lineJoin = 'miter';
	// ctx.lineCap = 'butt';
	// ctx.miterLimit = 4;
	// ctx.lineWidth = 2;
	// ctx.strokeStyle = glassGradient;
	// ctx.moveTo(0, 0);
	// ctx.lineTo((topWidth-bottomWidth)/2, height);
	// ctx.lineTo((topWidth-bottomWidth)/2 +bottomWidth, height);
	// ctx.lineTo(topWidth, 0);
	// ctx.closePath();
	// ctx.stroke();

	ctx.restore();

	// cut the drawn rectangle
    //let image = ctx.getImageData(0,0,110,143);
    // copy into visual canvas at different position
    //destctx.putImageData(image, 0, 0);
}

export default {
    name: 'card',

    mounted () {      
      renderGlass(this.$refs['glass-canvas'].getContext('2d'), this.brew.remaining/this.brew.volume, this.brew.recipe.srm, 88, 121)
    },
    props: {
      brew: { type: Object },
      brew_sessions:{ type: Array }
    },
    watch: { 
      'brew.remaining': function(newVal, oldVal) { 
        console.log('Prop changed: ', newVal, ' | was: ', oldVal)
        if (newVal != oldVal) {
          var volume = this.brew.volume;
          var srm = this.brew.recipe.srm;
          var ctx = this.$refs['glass-canvas'].getContext('2d');
          requestAnimationFrame(function() {
            ctx.clearRect(0, 0, 110, 143)
            renderGlass(ctx, newVal/volume, srm, 88, 121)
          });
        }
      }
    },
    computed: {
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
      }
    },
    methods: {
      getRGBforSRM: function(srm) {
        return getRGBforSRM_imp(srm);
      },
      keg_refilled: function(new_brew) {
        this.brew = new_brew;
        var ctx = this.$refs['glass-canvas'].getContext('2d')
        ctx.clearRect(0, 0, 110, 143)
        renderGlass(ctx, this.brew.remaining/this.brew.volume, this.brew.recipe.srm, 88, 121)
        this.$refs['mySwiper'].swiperInstance.slideTo(0, //slide index
          300,  //speed in ms
          false); //runCallbacks
      },
      animate: function() {
        var self = this;
        console.log(this.brew.remaining)
        requestAnimationFrame(
          function () {
            self.brew.remaining = self.brew.remaining - 30.0;
            var ctx = self.$refs['glass-canvas'].getContext('2d')
            ctx.clearRect(0, 0, 110, 143)
            renderGlass(ctx, self.brew.remaining/self.brew.volume, self.brew.recipe.srm, 88, 121)

            if (self.brew.remaining > 0) {
              self.animate()
            }
          }
        )
      }
    },
    components: {
      kegcontrol,
      Swiper,
      SwiperSlide
    }
}
</script>

<style scoped>

.swiper {
  width: 380px;
  margin: 15px;
}

.card {
    background-color: #FFFFFF;
    padding: 15px;
    width: 350px;
    flex-shrink: 0;
    height: auto;
    min-height: 475px;
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

</style>
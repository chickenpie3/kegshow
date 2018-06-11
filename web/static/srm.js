
var srm_rgb_values = {
0: [249, 235, 190],  1:[241, 210, 128],
2: [231, 165, 053],  3:[217, 133, 021],
4: [203, 105, 006],  5:[189, 085, 000],
6: [175, 068, 000],  7:[161, 054, 000],
8: [148, 042, 000],  9:[135, 035, 000],
10:[126, 028, 000], 11:[114, 022, 000],
12:[104, 019, 019], 13:[096, 014, 000],
14:[087, 010, 000], 15:[079, 009, 001],
16:[073, 006, 000], 17:[067, 006, 001],
18:[062, 004, 000], 19:[057, 003, 001],
20:[051, 001, 000], 21:[047, 002, 000],
22:[042, 001, 000], 23:[039, 001, 000],
24:[036, 000, 000], 25:[032, 001, 000],
26:[030, 000, 000], 27:[028, 000, 000],
28:[024, 000, 000], 29:[022, 001, 000],
30:[020, 000, 000]
}


function getRGBforSRM(srm) {

    var srm_min = 0
    var srm_max = 30

    var rgb = srm_rgb_values[srm_min]

    if (srm >= srm_max) {
        rgb = srm_rgb_values[srm_max];
    } else if (srm > srm_min) {
        srm_low = Math.floor(srm)
        srm_lambda = srm - srm_low
        srm_high = srm_low + 1;

        rgb[0] = srm_rgb_values[srm_low][0] + srm_lambda * (srm_rgb_values[srm_high][0] - srm_rgb_values[srm_low][0])
        rgb[1] = srm_rgb_values[srm_low][1] + srm_lambda * (srm_rgb_values[srm_high][1] - srm_rgb_values[srm_low][1])
        rgb[2] = srm_rgb_values[srm_low][2] + srm_lambda * (srm_rgb_values[srm_high][2] - srm_rgb_values[srm_low][2])
    }

    //console.log('rgb(' + rgb[0] + ', ' + rgb[1] + ", " + rgb[2]+')')
    return 'rgb(' + Math.round(rgb[0]) + ', ' + Math.round(rgb[1]) + ", " + Math.round(rgb[2])+ ')'
}
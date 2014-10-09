// Code for generating a sequence of distinctive colors.

function hsv2rgb(hue, saturation, value) {
  var index = parseInt(hue * 6) % 6;
  var fraction = hue * 6 - parseInt(hue * 6);
  var r = 0, g = 0, b = 0;
  var p, q, t;
  p = value * (1 - saturation);
  q = value * (1 - fraction * saturation);
  t = value * (1 - (1 - fraction) * saturation);
  switch (index) {
    case 0:
      r = value; g = t; b = p;
      break;
    case 1:
      r = q; g = value; b = p;
      break;
    case 2:
      r = p; g = value; b = t;
      break;
    case 3:
      r = p; g = q; b = value;
      break;
    case 4:
      r = t; g = p; b = value;
      break;
    case 5:
      r = value; g = p; b = q;
      break;
  }
  return "rgb(" + parseInt(255 * r) + "," +
                  parseInt(255 * g) + "," +
                  parseInt(255 * b) + ")";
}

function min(a,b) {
  return a < b ? a : b;
}
function max(a,b) {
  return a > b ? a : b;
}

// As the hue gets more complex this makes it more saturated so the differences
// are clearer.
function SaturationFromIndex(id) {
  id++;
  var divisions = 6;
  var previous_divisions = 0;
  var x;
  for (x = 0; id >= divisions; ++x) {
      id -= (divisions);
      divisions += previous_divisions;
      previous_divisions = divisions;
  }
  return 0.3;  // min(0.5 + 0.0125 * x, 1.0);
}

// As the hue gets more complex the value decreases to further differentiate
// them from earlier colors.
function ValueFromIndex(id) {
  id++;
  var divisions = 12;
  var previous_divisions = 0;
  var x;
  for(x = 0; id >= divisions; ++x) {
      id -= (divisions);
      divisions += previous_divisions;
      previous_divisions = divisions;
  }
  return max(1 - 0.05 * x, 0.0);
}


// Returns more basic colors for lower numbers.
function HueFromIndex(id) {
  var previous_divisions = 0;
  var divisions = 3;
  var offset = 1.0/divisions;
  while (1) {
    if (id >= divisions) {
      id -= (divisions);
    } else {
      return offset + id/divisions;
    }
    divisions += previous_divisions;
    previous_divisions = divisions;
    offset = offset/2;
  }
}

// Returns an "rgb(123,45,67)"-style CSS color string.
function RandomLightColor(id) {
  id = id % 1000;  // Reuse colors at 1,000 id increments.
  var saturation = SaturationFromIndex(id);
  var value = ValueFromIndex(id);
  var hue = HueFromIndex(id);
  return hsv2rgb(hue, saturation, value);
}

var MAX_LINES = 12;
var begin = '<ul><li class="trace">';
var middle = '</li><li class="trace">';
var end = '</li></ul>';

var traceOn = false;

function trace(msg) {
	if (!traceOn) return;
    var output_window = document.getElementById("trace");
    var lines = output_window.innerHTML.toLowerCase();
    var lineList;
    
    if (lines.length > 0) {
        lineList = lines.substring(begin.length, lines.length - end.length).split(middle);
        while (lineList.length >= MAX_LINES) { lineList.shift(); }
        lineList.push(msg);
    }
    else {
        lineList = [ msg ];
    }
	
    output_window.innerHTML = begin +lineList.join(middle) +end;
}

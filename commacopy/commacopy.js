// Converts all the comma-ed numbers under the root element (or the whole page)
// into non-copying commas. This has the side-effect of adding a new style
// ('pre-comma') to the document. If you want to avoid this, set
// commaCopyAddedStyle to true and provide the CSS class yourself.
var commaCopyAddedStyle = false;
function commacopy(root) {
  if (!root) root = document;
  var re = /[-+]?(\d{1,3})(,\d\d\d)+(\.\d*)?/;
  var changed = false;
  var s = root.getElementsByTagName('*');
  for (var i = 0; i < s.length; i++) {
    var el = s[i];
    for (var j = 0; j < el.childNodes.length; j++) {
      if (el.childNodes[j].nodeType == 3) {
        var txtEl = el.childNodes[j];
        var txt = txtEl.nodeValue;
        if (txt.match(re)) {
          changed = true;
          var new_span = document.createElement("span");
          new_span.innerHTML = txt.replace(/,(\d\d\d)/g,
                "<span class='pre-comma'>$1</span>");
          el.replaceChild(new_span, txtEl);
        }
      }
    }
  }
  if (changed && !commaCopyAddedStyle) {
    var rule = "content: ',';";
    var styleSheetElement = document.createElement("style");
    styleSheetElement.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
    for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].disabled) continue;
      var mysheet = document.styleSheets[i];
      try {
        if (mysheet.insertRule) {
          var idx = mysheet.cssRules ? mysheet.cssRules.length : 0;
          mysheet.insertRule(".pre-comma:before { " + rule + " }", idx);
        } else if (mysheet.addRule) {
          mysheet.addRule(".pre-comma:before", rule);
        }
        commaCopyAddedStyle = true;
        return;
      } catch(err) {
      }
    }
  }
}

/* ******************************************************************
   Supporting functions: bundled here to avoid depending on a library
   ****************************************************************** */

// Dean Edwards/Matthias Miller/John Resig
// has a hook for commacopy.init already been added? (see below)
var commaCopyListenOnLoad = false;

/* for Mozilla/Opera9 */
if (document.addEventListener) {
  commaCopyListenOnLoad = true;
  document.addEventListener("DOMContentLoaded", function() { commacopy() }, false);
}

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
  commaCopyListenOnLoad = true;
  document.write("<script id=__cc_onload defer src=//0)><\/script>");
  var script = document.getElementById("__cc_onload");
  script.onreadystatechange = function() {
    if (this.readyState == "complete") {
      commacopy(); // call the onload handler
    }
  };
/*@end @*/

/* for Safari */
if (/WebKit/i.test(navigator.userAgent)) { // sniff
  commaCopyListenOnLoad = true;
  var _cctimer = setInterval(function() {
    if (/loaded|complete/.test(document.readyState)) {
      commacopy(); // call the onload handler
    }
  }, 10);
}

/* for other browsers */
/* Avoid this unless it's absolutely necessary (it breaks other libraries) */
if (!commaCopyListenOnLoad) {
  window.onload = function() { commacopy() };
}

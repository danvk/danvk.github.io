// Functions for binding the lmnopuz JS to Wave.

function $(id) { return document.getElementById(id); }

// Detect whether the browser supports the HTML5 File API.
function supportsUpload() {
  try {
    var f = new FileReader;
    return true;
  } catch (e) {
    return false;
  }
}

// Remove any existing focus boxes from the DOM.
function killFocusBoxes() {
  var els = document.getElementsByClassName("focusbox");
  for (var i = 0; i < els.length; i++) {
    els[i].parentNode.removeChild(els[i]);
  }
}

function makeCrossword() {
  var state = gapi.hangout.data.getState();
  if (!state) return;

  var crossword = state["crossword"] || null;

  if (crossword) {
    Crossword = parsePuz(unescape(crossword));
    if (!Crossword) {
      return;
    }
    Globals = {
    };

    // TODO(danvk): focus box's color should be same as player's color.
    killFocusBoxes();
    Globals.focusbox = new FocusBox('blue', 3 /* width */ , 4 /* z-index */, $('scroll-wrapper') /* container */);

    Globals.widget = new CrosswordWidget;
    Globals.widget.onChanged = function(x,y,let) { updateWave(x, y, let); };
    Globals.widget.onCursorMove = function(x,y) { updateCursor(x, y); }
    $('crossword').innerHTML = '';
    $('crossword').appendChild(Globals.widget.loadCrossword(Crossword));

    Globals.console = new Console(3, false);
    Globals.cluebox = $('current_clue');

    Globals.clues = new CluesUI(Crossword);
    $('clues').innerHTML = '';
    $('clues').appendChild(Globals.clues.container);

    Globals.roster = new Roster();
    $('roster').innerHTML = '';
    $('roster').appendChild(Globals.roster.container);

    // user -> color
    Globals.user_colors = {};
    Globals.has_typed = false;

    // user -> FocusBox object (excluding our own FocusBox)
    Globals.cursors = {};

    $('crossword_container').style.display = 'block';
    $('upload').style.display = 'none';

    handleResize();
    usersChanged();

    // We need to wait to set focus until the table has been rendered (so
    // that the offset stuff works) and until the clues have been created (so
    // that the initial ones will be highlighted).  This kinda sucks.
    Globals.widget.setFocus(Globals.widget.getSquareForClue(1, true), false);
  } else if (state['attachment_url'] !== undefined) {
    // TODO(danvk): remove this, I can't imagine how it would work in G+.
    // .puz file has been sent as an attachment. Do an XHR for it.
    var url = gapi.hangout.data.getValue('attachment_url');
    console.log("Doing XHR for " + url);
    gadgets.io.makeRequest(url, function(obj) {
      var puzData = obj.text;
      var delta = {};
      delta["crossword"] = escape(puzData);
      gapi.hangout.data.submitDelta(delta);
      console.log("XHR for " + url + " succeeded; return " +
                  puzData.length + " bytes");
    });

  } else {
    Crossword = undefined;
    $('upload').style.display = 'block';
    $('crossword_container').style.display = 'none';
    killFocusBoxes();
    handleResize();
  }
}

function handleResize() {
  if (typeof(Globals) == 'undefined' || !Globals.clues) return;
  var clue_height = $('crossword').childNodes[0].clientHeight +
                    $('current_clue').offsetHeight;
  Globals.clues.setHeight(clue_height);

  // Make the width of the console/roster table match that of the
  // crossword/clues table.
  $('bottomtable').style.width = $('toptable').clientWidth;

  if (Globals.cluebox) {
    Globals.cluebox.style.width = $('crossword').childNodes[0].clientWidth + "px";
  }

  Globals.console.scrollToBottom();

  handleLiveResize();
}

function handleLiveResize() {
  // This updates the position of the focus box.
  if (typeof(Globals) != 'undefined' && Globals.widget) {
    Globals.widget.focus();
  }

  var too_big = ($('crossword_container').offsetHeight > window.innerHeight);
  $('fullscreen-tip').style.display = too_big ? 'block' : 'none';
}

function addPuzToWave(files) {
  if (files.length != 1) {
    if (console) console.log("Need to upload one puz file!");
    return;
  }

  var reader = new FileReader();
  reader.onloadend = function(e) {
    var state = gapi.hangout.data.getState();
    var crossword = state["crossword"] || null;
    if (crossword) {
      if (console) console.log("Tried to add a second puz file!");
      return;
    }

    puz = parsePuz(e.target.result);
    if (!puz) {
      if (console) console.write("Couldn't parse puz file!");
      return;
    }

    // Wave can only store string -> string maps, so it's easiest to submit the
    // binary .puz file to the wave.
    gapi.hangout.data.submitDelta( { crossword: escape(e.target.result) } );
  };

  reader.readAsBinaryString(files[0]);
}

// function addBuiltInPuzToWave(puz_file) {
//   gapi.hangout.data.submitDelta( { crossword: puz_file } );
// }

function getMyId() {
  // var me = wa ve.getViewer().getId();
  // This is the user's Google+ ID, e.g. 123456789727111132824
  // Also of interest: person.displayName, person.image.url, person.image

  // TODO(danvk): be more graceful when this happens:
  // There may be a small window of time where the local participant (returned
  // from getParticipantId()) is not in the returned array.
  // https://developers.google.com/+/hangouts/reference#gapi.hangout.getParticipants

  var me = gapi.hangout.getParticipantById(gapi.hangout.getParticipantId());
  return me.person.id;
}

// Returns a color for the current user. If the user does not have a color, one
// will be assigned and sent along to the other participants in the wave. It is
// posible that this color will change later, if there is a conflict with
// another user.
function getMyColor() {
  if (!gapi.hangout.data) return '#dddddd';

  var state = gapi.hangout.data.getState();
  if (!state) return '#dddddd';

  // This is what we think our color is.
  // It's possible that someone else has stolen it from us.
  var my_color = Globals.my_color;

  // This is the user's Google+ ID, e.g. 123456789727111132824
  // Also of interest: person.displayName, person.image.url, person.image
  var me = getMyId();

  if (!my_color || state["@" + my_color] != me) {
    // Either we haven't assigned ourselves a color yet or someone stolen this
    // color from us. In either case, assign ourselves a new one.
    var claimed_colors = {};
    for (var x in Globals.user_colors) {
      claimed_colors[Globals.user_colors[x]] = true;
    }
    var count = 0;
    var color;
    while (1) {
      color = RandomLightColor(count);
      if (!claimed_colors[color]) break;
      count++;
    }

    var delta = {};
    delta["@" + color] = me;
    gapi.hangout.data.submitDelta(delta);
    updateMyColor(color);
    if (console) console.log("Assigning self color #" + count + ": " + color);
  }
  return Globals.my_color;
}

function addHighlightCSS(color) {
  var rule = '#crosswordui td.highlighted { ' +
      'background: ' + color + ' !important; }'
  var styleSheetElement = document.createElement("style");
  styleSheetElement.type = "text/css";
  styleSheetElement.innerHTML = rule;
  document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
}

function updateWave(x, y, let) {
  if (gapi.hangout.data) {
    var k = "" + x + "," + y;
    var delta = {};
    delta[k] = let + "\t" + getMyId();
    getMyColor();  // make sure we have a color assigned to us.
    gapi.hangout.data.submitDelta(delta);
    Globals.has_typed = true;
    // Globals.console.write("delta: {" + x + "," + y + ": " + let + "}");
  }
}

function updateMyColor(new_color) {
  Globals.my_color = new_color;

  // Write a new CSS rule to color the highlighted answer in our color.
  var my_hex_color = makeHexColor(parseRGBColor(Globals.my_color));
  addHighlightCSS(darkenHexColor(my_hex_color, 0.90));

  // just leaving it blue for now.
  // var dark_color = darkenHexColor(color, 0.5);
  // Globals.focusbox.setColor(dark_color);
}

// Our cursor has moved to this position.
function updateCursor(x, y) {
  if (gapi.hangout.data) {
    // Don't send out deltas until colors have been sorted out.
    var state = gapi.hangout.data.getState();
    if (!Globals.my_color ||
        state['@' + Globals.my_color] != getMyId()) {
      return;
    }

    var k = "c" + getMyId();
    var delta = {};
    delta[k] = x + "," + y;
    gapi.hangout.data.submitDelta(delta);
  }
}

function stateUpdated() {
  var state = gapi.hangout.data.getState();
  if (typeof(Crossword) == 'undefined' || !("crossword" in state)) {
    makeCrossword();
  }

  if (state && state["crossword"] !== undefined) {
    var me = getMyId();
    var keys = gapi.hangout.data.getKeys();

    // Make two passes through the state: one for the colors, one for the cells.
    var my_color = null;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.substr(0, 1) != "@") continue;
      // must be a user color: "@color" -> "user@domain.com"
      var color = k.substr(1);
      var user = state[k];
      Globals.user_colors[user] = color;
      if (user == me) {
        my_color = color;
      }
    }

    if (Globals.my_color == null || Globals.my_color != my_color) {
      if (!my_color) {
        // The was probably a race condition and someone stole our color.
        // Assign ourselves a new one.
        my_color = getMyColor();
      }
      updateMyColor(my_color);
    }

    // Pass two: cells on the grid.
    var any_from_me = false;
    var cursors = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.substr(0, 1) == "@") continue;
      if (k.substr(0, 1) == "c") {
        cursors[k.substr(1)] = state[k];
        continue;
      }

      // must be a cell: "x,y" -> "letter,user@domain.com"
      var xy = k.split(",");
      if (xy.length != 2) continue;
      var x = parseInt(xy[0]);
      var y = parseInt(xy[1]);
      if (isNaN(x) || isNaN(y)) continue;
      var square = Globals.widget.square(x, y);
      if (!square) continue;

      var letter_user = state[k].split("\t");
      if (letter_user.length != 2) continue;
      var letter = letter_user[0];
      var user = letter_user[1];

      // TODO(danvk): keep an inverted copy of this map.
      var color = Globals.user_colors[user];
      if (!color) {
        color = '#dddddd';
      }

      var isGuess = (letter != letter.toUpperCase());
      square.fill(letter.toUpperCase(), color, isGuess);

      if (user == me) any_from_me = true;
    }

    usersChanged();

    for (var id in cursors) {
      if (id == getMyId()) continue;
      if (!Globals.cursors[id]) {
        if (!Globals.user_colors[id]) continue;
        Globals.cursors[id] =
            new FocusBox(Globals.user_colors[id], 2, 3, $('scroll-wrapper'));
      }

      var xy = cursors[id].split(",");
      if (xy.length != 2) continue;
      var x = parseInt(xy[0], 10);
      var y = parseInt(xy[1], 10);
      if (isNaN(x) || isNaN(y)) continue;

      var square = Globals.widget.square(x, y);
      Globals.widget.moveFocusBoxToSquare(Globals.cursors[id], square);
    }

    if (Globals.widget.isPuzzleCompleted()) {
      if (Globals.widget.isSolutionCorrect(Crossword)) {
        $('puzzle-done').style.display = 'none';
        $('puzzle-correct').style.display = 'block';
        Globals.widget.setCorrect();  // makes puzzle immutable.
      } else {
        $('puzzle-done').style.display = 'block';
        $('puzzle-correct').style.display = 'none';
      }

      var rexUrl = getRexUrl(Crossword);
      if (rexUrl) {
        var rexes = document.getElementsByClassName('rex-url');
        for (var i = 0; i < rexes.length; i++) {
          rexes[i].style.visibility = 'visible';
          rexes[i].getElementsByTagName("a")[0].href = rexUrl;
        }
      }
    } else {
      $('puzzle-done').style.display = 'none';
      $('puzzle-correct').style.display = 'none';

      var rexes = document.getElementsByClassName('rex-url');
      for (var i = 0; i < rexes.length; i++) {
        rexes[i].style.visibility = 'hidden';
      }
    }
  }
}

function usersChanged(gapi_users) {
  if (typeof(Globals) === 'undefined' || !Globals.roster) return;

  var all_users = gapi.hangout.getParticipants();
  var users = [];

  for (var i = 0; i < all_users.length; i++) {
    var user = all_users[i];
    if (!user.hasAppEnabled) continue;

    var p = user.person;

    var display_user = {
      image_url: p.image.url,
      name: p.displayName,
      color: Globals.user_colors[p.id] || '#dddddd'
    };
    users.push(display_user);
  }

  Globals.roster.updateUsers(users);
}

function newPuzzle() {
  // Delete all keys -- this will trigger a state update for everyone
  // which resets the puzzle to the "Upload" screen.
  // TODO(danvk): archive previous puzzles in some way.
  var keys = gapi.hangout.data.getKeys();
  var keysToKill = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k.substr(0, 1) == "@") continue;
    if (k == "crossword") continue;  // will handle specially
    keysToKill.push(k);
  }

  // The hangouts API doesn't like really big deltas, so we chunk this.
  // So long as the crossword disappears first, no one should be able to
  // tell the difference.
  gapi.hangout.data.submitDelta({}, ['crossword']);
  while (keysToKill.length > 0) {
    gapi.hangout.data.submitDelta({}, keysToKill.splice(0, 20));
  }
}

// (for debugging)
function fillAll() {
  for (var x = 0; x < Globals.widget.crossword.width; x++) {
    for (var y = 0; y < Globals.widget.crossword.height; y++) {
      var square = Globals.widget.square(x, y);
      if (square) square.fill('X', 'rgb(255,0,0)', false);
    }
  }
}

function fillSolution(num_blank) {
  if (!num_blank) num_blank = 0;
  var c = Globals.widget.crossword;
  for (var x = 0; x < c.width; x++) {
    for (var y = 0; y < c.height; y++) {
      if (x == c.width - 1 && y >= c.height - num_blank) continue;
      var square = Globals.widget.square(x, y);
      if (square) square.fill(square.answer, 'rgb(255,0,0)', false);
    }
  }
}

function getRexUrl(puzzle) {
  if (puzzle.copyright.indexOf('The New York Times') == -1) return null;

  return 'http://google.com/search?q=' +
      escape(puzzle.title) +
      '%20site%3Arexwordpuzzle.blogspot.com&btnI';
}

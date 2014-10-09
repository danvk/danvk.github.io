// Crossword Javascript
// Copyright (c) 2005 Evan Martin <martine@danga.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


// Constructor.
function CrosswordWidget() {
  // Whether input is in left-to-right or top-to-bottom mode.
  this.direction_horiz = true;

  // Which square has the input focus.
  this.focused = undefined;

  // Which squares are currently highlighted.
  this.highlighted = [];

  // Are we editing a rebus square?
  this.in_rebus = false;
};

CrosswordWidget.prototype.loadCrossword = function(crossword) {
  var widget = this;

  // The onkeydown handler prevents the "default actions" from taking place for
  // special keys (arrows, tab, backspace) in Safari and Chrome. In Firefox,
  // both onkeypress and onkeyup then fire. In Safari and Chrome, only onkeyup
  // fires. We can get around all this mess by just using onkeydown.
  document.onkeydown = function(e) { return widget.keyDown(e); };
  document.onmousedown = function() { widget.focus(); };

  this.crossword = crossword;

  var table = document.createElement('table');
  table.id = 'crosswordui';
  table.cellPadding = 0;
  table.cellSpacing = 0;

  var tbody = document.createElement('tbody');

  this.squares = [];

  for (var y = 0; y < crossword.height; ++y) {
    this.squares[y] = [];
    var tr = document.createElement('tr');
    for (var x = 0; x < crossword.width; ++x) {
      var sq = crossword.squares[x][y];
      if (sq) {
        var square = new Square(this, x, y, sq);
        tr.appendChild(square.td);
        this.squares[y][x] = square;
      } else {
        var td = document.createElement('td');
        td.className = 'filled';
        tr.appendChild(td);
      }
    }
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  this.tbody = tbody;

  if (document.getElementById("puzzle_info")) {
    var el = document.getElementById("title");
    if (el) el.innerHTML = crossword["title"];
    el = document.getElementById("author");
    if (el) el.innerHTML = crossword["author"];
    el = document.getElementById("copyright");
    if (el) el.innerHTML = crossword["copyright"];
  }

  // Hack -- we need something to focus when we want to take the focus away
  // from other input widgets (console, roster, etc.).  Focusing non-input
  // elements doesn't seem to do anything, so we create an invisible input
  // to use.  At least in Firefox, inputs with display: none don't appear
  // to receive any events but can still take the focus.
  this.hiddeninput = document.createElement('input');
  this.hiddeninput.style.display = 'none';
  document.body.appendChild(this.hiddeninput);

  // Start the fader.
  window.setTimeout(this.fadeSquareColors, 0);

  return table;
};

// Return the square at (x, y).
CrosswordWidget.prototype.square = function(x, y) {
  return this.squares[y][x];
};

// Focus the clues for the passed-in square.
CrosswordWidget.prototype.focusClues = function(square) {
  Globals.clues.focusClues(
      this.getNumber(square, true),
      this.getNumber(square, false),
      this.direction_horiz);

  // Update the "Current Clue" box.
  if (Globals.cluebox) {
    var num = this.getNumber(square, this.direction_horiz);
    var clue_str = num + (this.direction_horiz ? "A" : "D");
    clue_str += Globals.clues.getClueText(num, this.direction_horiz);

    // See if the text is too wide to fit. If it is, shrink it (up to a point).
    var cb = Globals.cluebox;
    if (!Globals.size_div) {
      // Copy all styles from the clue box, except for a few that
      // make it invisible.
      var div = document.createElement("div");
      var computed = window.getComputedStyle(cb, null);
      for (var i = 0; i < computed.length; i++) {
        div.style[computed[i]] = computed[computed[i]];
      }

      div.style.position = 'absolute';
      div.style.left = '-500px';
      div.style.top = '-500px';
      div.style.width = 'auto';
      div.style.height = 'auto';

      // div.style.border = '1px solid black';
      document.body.appendChild(div);
      Globals.size_div = div;
    }

    Globals.size_div.textContent = clue_str;
    var textWidth = Globals.size_div.clientWidth;
    var divWidth = Globals.cluebox.clientWidth - 10;

    var pct = 100.0;
    if (divWidth < textWidth) {
      pct *= divWidth / textWidth;
      if (pct < 67) {
        pct = 67;
      }
    }

    // TODO(danvk): escape clue_str.
    Globals.cluebox.innerHTML = "<div style='font-size: " + pct + "%'>" + clue_str + "</div>";
  }
};

// Change the focus to the given target square.
CrosswordWidget.prototype.setFocus = function(target, flip_if_focused) {
  if (!target) return;
  if (this.focused == target) {
    if (flip_if_focused) this.direction_horiz = !this.direction_horiz;
    this.highlightRegion(target);
  } else {
    this.focused = target;
    this.highlightRegion(target);
    this.moveFocusBoxToSquare(Globals.focusbox, target);
    if (this.onCursorMove) this.onCursorMove(target.x, target.y);
  }
  this.focusClues(target);
};

// Make the focusbox surround a given square.
CrosswordWidget.prototype.moveFocusBoxToSquare = function(focusbox, square) {
  focusbox.moveTo(findPosX(square.letter),
                  findPosY(square.letter),
                  square.td.offsetWidth-1,
                  square.td.offsetHeight-1,
                  true);
};

// Starting at square, move the focus by (dx,dy), stopping at the edge
// of the puzzle.
// Skips over black squares if skip_black == true (i.e. for arrow keys).
// Skips over filled squares if skip_filled == true (i.e. if you're typing).
// TODO(danvk): this logic is getting really convoluted; rework it.
CrosswordWidget.prototype.focusNext = function(square, dx, dy,
                                               skip_black, skip_filled) {
  var start_square = square;
  var x = square.x;
  var y = square.y;

  x += dx; y += dy;
  while (x >= 0 && x < this.crossword.width &&
         y >= 0 && y < this.crossword.height) {
    square = this.square(x,y);
    if (square) {
      this.setFocus(square, false);
      if (!skip_filled || square.getLetter() == '') {
        return;
      }
    } else {
      if (skip_filled) {
        // Must have been completely filled-in. Just go to the next square.
        return this.focusNext(start_square, dx, dy, false, false);
      }

      if (!skip_black) {
        return;
      }
    }
    x += dx; y += dy;
  }

  if (skip_filled) {
    // Must have been completely filled-in. Just go to the next square.
    return this.focusNext(start_square, dx, dy, false, false);
  }
};

CrosswordWidget.prototype.changeSquareHighlight = function(square, highlight) {
  if (highlight) {
    square.td.className = 'highlighted';
  } else {
    square.td.className = '';
  }
};

// Get the square at the start or end of the passed-in square's word.
CrosswordWidget.prototype.getStartSquare =
    function(square, direction_horiz, is_start) {
  var dx = direction_horiz ? 1 : 0;
  var dy = direction_horiz ? 0 : 1;
  if (is_start) { dx *= -1; dy *= -1; }

  var x = square.x, y = square.y;
  while (x >= 0 && y >= 0 &&
         x < this.crossword.width && y < this.crossword.height &&
         this.square(x,y)) {
    h = this.square(x,y);
    x += dx; y += dy;
  }
  return h;
};

// Move to the first blank square past the given square.
// This is used when the player hits tab or shift-tab.
CrosswordWidget.prototype.getNextUnfilled = function(square, direction_horiz) {
  var dx = direction_horiz ? 1 : 0;
  var dy = direction_horiz ? 0 : 1;

  var x = square.x, y = square.y;
  while (x >= 0 && y >= 0 &&
         x < this.crossword.width && y < this.crossword.height &&
         this.square(x,y)) {
    h = this.square(x,y);
    if (h.getLetter() == '') return h;
    x += dx; y += dy;
  }
  return square;  // It's completely filled; May as well go to the start.
};

// Get the word number of the passed-in square.
CrosswordWidget.prototype.getNumber = function(square, direction_horiz) {
  return this.getStartSquare(square, direction_horiz, true).number;
};

// Starting at square, highlight all squares that are within the
// current clue (as determined by the current input direction).
CrosswordWidget.prototype.highlightRegion = function(square) {
  // unhighlight existing highlights...
  for (var i = 0; i < this.highlighted.length; ++i)
    this.changeSquareHighlight(this.highlighted[i], false);
  this.highlighted = [];

  if (square) {
    this.highlighted = [];

    var h = this.getStartSquare(square, this.direction_horiz, true);
    var end = this.getStartSquare(square, this.direction_horiz, false);
    var dx = this.direction_horiz ? 1 : 0;
    var dy = this.direction_horiz ? 0 : 1;

    do {
      this.highlighted.push(h);
      this.changeSquareHighlight(h, true);
    } while (h.x + dx <= end.x && h.y + dy <= end.y &&
             (h = this.square(h.x + dx, h.y + dy)));
  }
};

// Get the next or previous square, skipping blanks and wrapping around the
// board if necessary.
CrosswordWidget.prototype.getNextSquare = function(square, is_next) {
  var dx = is_next ? 1 : -1;
  var dy = is_next ? 1 : -1;
  var x = square.x + dx;
  var y = square.y;
  if (x < 0) {
    x = this.crossword.width + x;
    y = (y == 0) ? this.crossword.height - 1 : y - 1;
  }
  if (x >= this.crossword.width) {
    x %= this.crossword.width;
    y = (y + 1) % this.crossword.height;
  }

  // yuck
  for (; x != square.x || y != square.y;
       y = (y + dy) % this.crossword.height,
       y = (y < 0) ? this.crossword.height - y : y,
       x = is_next ? 0 : this.crossword.width - 1) {
    for (; x >= 0 && x < this.crossword.width; x += dx) {
      if (this.square(x, y)) return this.square(x, y);
    }
  }
  return undefined;
};

// Get the first square of the next or previous word, wrapping around the
// board if necessary.
CrosswordWidget.prototype.getNextWord =
    function(square, direction_horiz, is_next) {
  if (direction_horiz == true) {
    // To find the next horizontal word, we move to the end of the current
    // word and then walk forward across the board until we find a
    // non-black square.
    square = this.getStartSquare(square, true, !is_next);
    square = this.getNextSquare(square, is_next);
    if (!square) return undefined;
    square = this.getStartSquare(square, true, true);
    square = this.getNextUnfilled(square, true);
    return square;
  } else {
    // To find the next vertical word, we move to the beginning of the
    // current word and walk forward across the board until we find a
    // non-black square that is on the top row or has a black square above
    // it.
    square = this.getStartSquare(square, false, true);
    while (square = this.getNextSquare(square, is_next)) {
      if (square.y == 0 || !this.square(square.x, square.y - 1)) {
        square = this.getNextUnfilled(square, false);
        return square;
      }
    }
    return undefined;
  }
};

// Get the filled-in letters for the passed-in word. "." is used for
// blanks.
CrosswordWidget.prototype.getLetters = function(number, across) {
  var square = this.getSquareForClue(number, across);
  if (!square) return undefined;

  var word = '';
  var dx = across ? 1 : 0;
  var dy = across ? 0 : 1;

  for (var x = square.x, y = square.y;
       x < this.crossword.width && y < this.crossword.height;
       x += dx, y += dy) {
    var square = this.square(x, y);
    if (!square) break;
    var letter = square.getLetter();
    word += (letter != '') ? letter : '.';
  }
  return word;
};

CrosswordWidget.prototype.keyDown = function(e) {
  if (!this.focused) return true;
  if (!e) e = window.event;
  if (e.altKey || e.ctrlKey || e.metaKey) return true;

  if (this.in_rebus) return this.rebusKeyDown(e);

  // Safari and Chrome capture special keys by default. We need to
  // "preventDefault" on the event to stop this from happening.
  var keycode = e.keyCode;
  if (   keycode == 9 || keycode == 25  // tab
      || keycode == 35 || keycode == 63275  // end
      || keycode == 36 || keycode == 63273  // home
      || keycode == 37 || keycode == 63234  // left
      || keycode == 38 || keycode == 63232  // up
      || keycode == 39 || keycode == 63235  // right
      || keycode == 40 || keycode == 63233  // down
      || keycode == 27  // escape
      || keycode == 8  // backspace
      || keycode == 46 || keycode == 63272) { // delete
    e.preventDefault();
  }

  return this.keyPress(e);
};

CrosswordWidget.prototype.keyPress = function(e) {
  if (!this.focused) return true;
  var square = this.focused;

  if (!e) e = window.event;
  // don't eat ctl-r and friends...
  if (e.altKey || e.ctrlKey || e.metaKey)
    return true;

  // charCode is set if a Unicode character was pressed
  var charcode = e.charCode;
  // keyCode is set for specials (tab, arrows, etc.).
  // Crazy-looking key codes (63xxx) are for Safari.
  var keycode = e.keyCode;

  if (!charcode) {
    charcode = keycode;
  }

  // console.log('e.charcode=' + e.charCode + ' e.keyCode=' + e.keyCode + ' shift=' + e.shiftKey);

  if (charcode == 32) {  // space pressed: switch direction
    this.direction_horiz = !this.direction_horiz;
    this.focusClues(square);
    this.highlightRegion(square);
  } else if (charcode >= 97 && charcode <= 122 ||
             charcode >= 65 && charcode <= 90) {  // letter
    if (!this.correct) {
      var str = String.fromCharCode(charcode);
      var color = Globals && Globals.mp ? Globals.mp.getColor() : undefined;
      // it's only an update if the square was changed.
      var isGuess = e.shiftKey;
      str = str.toUpperCase();
      square.fill(str, color, isGuess);
      if (this.onChanged) {
        // lowercase = "pencil", uppercase = "pen".
        this.onChanged(square.x, square.y, isGuess ? str.toLowerCase() : str);
      }

      // TODO(danvk): make skip_filled a global parameter here.
      if (this.direction_horiz)
        this.focusNext(square, 1, 0, false, true);
      else
        this.focusNext(square, 0, 1, false, true);
    }
  } else if (charcode == 63) {  // question mark
    if (this.onMessageSent) {
      var num = this.getNumber(square, this.direction_horiz);
      var msg = 'Check out ' + num + " " +
        (this.direction_horiz ? 'Across' : 'Down') + ': "' +
        Globals.clues.getClueText(num, this.direction_horiz) + '", ' +
        this.getLetters(
            num, this.direction_horiz).replace(/\./g, '_').split('').join(' ');
      this.onMessageSent(msg);
    }
  } else if (charcode == 46) {  // period
    Globals.console.clickLastLink();
  } else if (charcode == 47) {  // slash
    Globals.console.focus();
  } else if (charcode == 126 || (charcode == 192 && e.shiftKey)) {  // tilde
    // TODO(danvk): what code does '~' come out as on other platforms/browsers.
    if (!this.correct) this.toggleGuessForWord(square);
  } else if (keycode == 9 || keycode == 25) { // tab
    var forwards = !e.shiftKey;
    if (keycode == 25) forwards = false;  // safari has a weird shift-tab.
    this.setFocus(
      this.getNextWord(square, this.direction_horiz, forwards),
      false);
  } else if (keycode == 35 || keycode == 63275) { // end
    this.setFocus(
      this.getStartSquare(square, this.direction_horiz, false), false);
  } else if (keycode == 36 || keycode == 63273) { // home
    this.setFocus(
      this.getStartSquare(square, this.direction_horiz, true), false);
  } else if (keycode == 37 || keycode == 63234) { // left
    this.focusNext(square, -1, 0, true, false);
  } else if (keycode == 38 || keycode == 63232) { // up
    this.focusNext(square, 0, -1, true, false);
  } else if (keycode == 39 || keycode == 63235) { // right
    this.focusNext(square, 1, 0, true, false);
  } else if (keycode == 40 || keycode == 63233) { // down
    this.focusNext(square, 0, 1, true, false);
  } else if (keycode == 8) { // backspace
    if (!this.correct) {
      if (e.shiftKey) {
        this.clearWord(square);
      } else {
        square.fill('', '', false);
        if (this.direction_horiz)
          this.focusNext(square, -1, 0, false, false);
        else
          this.focusNext(square, 0, -1, false, false);
        if (this.onChanged)
          this.onChanged(square.x, square.y, ' ');
      }
    }
  } else if (keycode == 46 || keycode == 63272) { // delete
    if (!this.correct) {
      if (e.shiftKey) {
        this.clearWord(square);
      } else {
        square.fill('', '', false);
        if (this.onChanged)
          this.onChanged(square.x, square.y, ' ');
      }
    }
  } else if (keycode == 27) {  // escape
    if (!this.correct) this.showRebusForm();
  } else {
    return true;
  }
  return false;
};

CrosswordWidget.prototype.selectByClue = function(number, across) {
  var square = this.getSquareForClue(number, across);
  if (square) {
    this.direction_horiz = across;
    this.setFocus(square, false);
  }
}

CrosswordWidget.prototype.getSquareForClue = function(number, across) {
  for (var y = 0; y < this.crossword.height; ++y) {
    for (var x = 0; x < this.crossword.width; ++x) {
      var square = this.square(x,y);
      if (square && square.number == number &&
          square == this.getStartSquare(square, across, true)) {
        return square;
      }
    }
  }
};

// Are all of the squares in the answer containing 'square' in direction
// 'across' filled in with non-guess letters?
CrosswordWidget.prototype.isWordFilled = function(square, across) {
  var is_filled = true;
  var dx = across ? 1 : 0;
  var dy = across ? 0 : 1;

  square = this.getStartSquare(square, across, true);
  for (var x = square.x, y = square.y;
       x < this.crossword.width && y < this.crossword.height;
       x += dx, y += dy) {
    var s = this.square(x, y);
    if (!s) break;
    if (!s.letter.text || s.letter.text.data == '' || s.guess) {
      is_filled = false;
      break;
    }
  }
  return is_filled;
};

// Toggle the guess-ness of an answer, with the following tricky behavior:
// If all of the squares in the word are non-guesses, we switch them to
// guesses.  Otherwise, we switch them all to non-guesses.  We won't switch
// any given square to a guess if the answer in the other direction that
// contains it is entirely filled with non-guess letters.
CrosswordWidget.prototype.toggleGuessForWord = function(square) {
  var start = this.getStartSquare(square, this.direction_horiz, true);
  var dx = this.direction_horiz ? 1 : 0;
  var dy = this.direction_horiz ? 0 : 1;

  // Expand the focus box to bound the entire word.
  var end = this.getStartSquare(square, this.direction_horiz, false);
  var x = findPosX(start.letter);
  var y = findPosY(start.letter);
  var w = findPosX(end.letter) + end.letter.offsetWidth - 1 - x;
  var h = findPosY(end.letter) + end.letter.offsetHeight - 1 - y;
  Globals.focusbox.moveTo(x, y, w, h, false);

  // First, decide whether we want to convert the squares to guesses or to
  // non-guesses.
  var to_guess = true;
  var x, y;
  for (x = start.x, y = start.y;
       x < this.crossword.width && y < this.crossword.height;
       x += dx, y += dy) {
    var s = this.square(x, y);
    if (!s) break;
    if (!s.letter.text) continue;
    if (s.letter.text.data != '' && s.guess) {
      to_guess = false;
      break;
    }
  }

  // Go through the squares again, this time updating them.
  for (x = start.x, y = start.y;
       x < this.crossword.width && y < this.crossword.height;
       x += dx, y += dy) {
    var s = this.square(x, y);
    if (!s) break;
    if (!s.letter.text) continue;

    // Find out whether the answer in the other direction that contains
    // this square is filled with non-guesses.
    var cross_filled = this.isWordFilled(s, !this.direction_horiz);

    var ch = s.letter.text.data;
    if (ch != '') {
      var guess = !cross_filled && to_guess;
      s.fill(ch, undefined, guess);
      if (this.onChanged) {
        this.onChanged(x, y, guess ? ch.toLowerCase() : ch.toUpperCase());
      }
    }
  }

  // 100 ms later, shrink the focus box to just cover the focused square.
  window.setTimeout(
    function() {
      Globals.widget.moveFocusBoxToSquare(
        Globals.focusbox, Globals.widget.focused);
    }, 100);
};

// Clear all letters in the answer containing this square, except for ones
// whose word in the other direction is already filled.
CrosswordWidget.prototype.clearWord = function(square) {
  var start = this.getStartSquare(square, this.direction_horiz, true);
  var dx = this.direction_horiz ? 1 : 0;
  var dy = this.direction_horiz ? 0 : 1;

  // Expand the focus box to bound the entire word.
  var end = this.getStartSquare(square, this.direction_horiz, false);
  var x = findPosX(start.letter);
  var y = findPosY(start.letter);
  var w = findPosX(end.letter) + end.letter.offsetWidth - 1 - x;
  var h = findPosY(end.letter) + end.letter.offsetHeight - 1 - y;
  Globals.focusbox.moveTo(x, y, w, h, false);

  // Go through the squares, updating them.
  for (x = start.x, y = start.y;
       x < this.crossword.width && y < this.crossword.height;
       x += dx, y += dy) {
    var s = this.square(x, y);
    if (!s) break;

    // Skip this square if the answer in the other direction is filled with
    // non-guesses.
    if (this.isWordFilled(s, !this.direction_horiz)) continue;

    s.fill('', '', false);
    if (this.onChanged) this.onChanged(x, y, ' ');
  }

  // 100 ms later, shrink the focus box to just cover the focused square.
  window.setTimeout(
    function() {
      Globals.widget.moveFocusBoxToSquare(
        Globals.focusbox, Globals.widget.focused);
    }, 100);
};

// Mark the puzzle as correct, making it immutable.
CrosswordWidget.prototype.setCorrect = function() {
  if (!this.correct) {
    this.correct = true;
    for (var x = 0; x < Globals.widget.crossword.width; x++) {
      for (var y = 0; y < Globals.widget.crossword.height; y++) {
        var square = this.square(x, y);
        if (!square) continue;
        square.letter.className = 'letter';
        square.td.style.background = square.base_color;
      }
    }
  }
};

CrosswordWidget.prototype.focus = function() {
  if (this.in_rebus) this.hideRebusForm();

  this.hiddeninput.focus();
  if (this.focused) {
    this.moveFocusBoxToSquare(Globals.focusbox, this.focused);
  }
};

CrosswordWidget.prototype.blur = function() {
  this.focused = undefined;
};

CrosswordWidget.prototype.fadeSquareColors = function() {
  if (!Globals.widget.correct) {
    var fade_sec = 30;
    var min_opacity = 3.0 / 4.0;
    var cycle_sec = 3;
    var now = new Date().getTime() / 1000;

    // We only need to cycle through the individual cells if one has been
    // changed recently.
    if (Globals.widget.last_change_time &&
        now - Globals.widget.last_change_time < fade_sec + cycle_sec) {
      for (var x = 0; x < Globals.widget.crossword.width; x++) {
        for (var y = 0; y < Globals.widget.crossword.height; y++) {
          var s = Globals.widget.square(x, y);
          if (!s) continue;
          if (s.base_color != undefined &&
              s.color_set_time != undefined &&
              now - s.color_set_time < fade_sec + cycle_sec) {
            // var colors = parseHexColor(s.base_color);
            // if (!colors) continue;

            var opacity = 1.0 - min_opacity * (now - s.color_set_time) / fade_sec;
            if (opacity < 0.0) opacity = 0.0;
            // if (opacity < min_opacity) opacity = min_opacity;

            var color_str = lightenHexColor(s.base_color, opacity);
            if (!color_str) continue;
            s.td.style.background = color_str;
          }
        }
      }
    }
    window.setTimeout(Globals.widget.fadeSquareColors, cycle_sec * 1000);
  }
};

CrosswordWidget.prototype.showRebusForm = function() {
  var square = this.focused;
  if (!square) return;

  var x = findPosX(square.td);
  var y = findPosY(square.td);

  var form = document.getElementById("rebus-form");
  var textbox = document.getElementById('rebus-text');
  form.style.left = (x + 1) + 'px';
  form.style.top = (y + 1) + 'px';
  textbox.value = square.displayedLetter;
  form.style.visibility = 'visible';
  textbox.select();
  this.in_rebus = true;
};

CrosswordWidget.prototype.rebusKeyDown = function(e) {
  var keycode = e.keyCode;
  if (keycode == 13) {  // enter
    var square = this.focused;
    var answer = document.getElementById('rebus-text').value.toUpperCase();
    var color = Globals && Globals.mp ? Globals.mp.getColor() : undefined;

    square.fill(answer, color, false);
    if (this.onChanged) {
      this.onChanged(square.x, square.y, answer);
    }

    this.hideRebusForm();
    e.preventDefault();
    return false;
  } else if (keycode == 27) {  // escape
    this.hideRebusForm();
    e.preventDefault();
    return false;
  } else {
    return true;
  }
};

CrosswordWidget.prototype.hideRebusForm = function() {
  if (!this.in_rebus) return;
  var form = document.getElementById("rebus-form");
  form.style.visibility = 'hidden';
  this.in_rebus = false;
};

CrosswordWidget.prototype.isPuzzleCompleted = function() {
  var numFilled = 0;
  for (var x = 0; x < Globals.widget.crossword.width; x++) {
    for (var y = 0; y < Globals.widget.crossword.height; y++) {
      var square = this.square(x, y);
      if (!square) continue;
      if (square.displayedLetter == '') return false;
      numFilled++;
    }
  }
  
  return (numFilled > 0);
};

CrosswordWidget.prototype.isSolutionCorrect = function(c) {
  var our_answer = [];
  for (var x = 0; x < Globals.widget.crossword.width; x++) {
    var row = [];
    for (var y = 0; y < Globals.widget.crossword.height; y++) {
      var square = this.square(x, y);
      if (!square) {
        row.push(null);
        continue;
      }
      if (square.displayedLetter == '') return false;
      row.push(square.displayedLetter);
    }
    our_answer.push(row);
  }

  return isPuzzleCorrect(c, our_answer);
};

// Constructor for our per-square data.
Square = function(widget, x, y, squareData) {
  this.x = x;
  this.y = y;
  // TODO(danvk): just store squareData
  this.answer = squareData.char;
  // TODO(danvk): move this into puzparser
  this.number = squareData.across || squareData.down || 0;
  this.displayedLetter = '';

  var square = this;
  this.td = document.createElement('td');
  this.td.square = this;   // this is probably bad for IE...  *shrug*
  this.td.onmousedown = function() { widget.setFocus(this.square, true); };
  this.td.ondblclick = function(e) {
    e.preventDefault();
    return true;
  };

  if (this.number != 0) {
    var numberdiv = document.createElement('div');
    numberdiv.className = 'number';
    numberdiv.appendChild(document.createTextNode(this.number));
    this.td.appendChild(numberdiv);
  }

  this.letter = document.createElement('div');
  this.letter.className = 'letter';
  if (squareData.circled) {
    var circle = document.createElement('div');
    circle.className = 'circle';
    this.letter.appendChild(circle);
  }

  // We also create a plain text node and call it "text".
  // We'd like to do that right here, but Safari disappears the text node
  // if it's created empty.  So we instead create it lazily below.
  this.letter.text = undefined;  //(document.createTextNode(' '));
  this.td.appendChild(this.letter);
};

Square.prototype.getLetter = function() {
  return this.letter.text ? this.letter.text.data : '';
};

Square.prototype.setClassName = function() {
  this.letter.className = 'letter' +
      (this.guess ? ' guess' : '') +
      (this.displayedLetter.length > 1 ? ' rebus' : '');
};

// Fill a square with a given letter.  'color' is the background color for
// the square, and can either be a hex color, '' (to clear the background),
// or undefined (to leave the background unchanged).  If 'is_guess' is
// true, the letter will be written in gray instead of black.
Square.prototype.fill = function(letter, color, is_guess) {
  // We create letter.text lazily, but must be careful to never create
  // one that's empty, because otherwise Safari will never show it.  :(
  if (letter == '' || letter == ' ') {  // erasing
    if (this.letter.text)
      this.letter.text.data = '';
    this.td.style.background = 'white';
    this.base_color = null;
    this.displayedLetter = '';
    return;
  }

  this.guess = is_guess;

  var changed = false;
  letter = letter.toUpperCase();
  if (!this.letter.text) {
    this.letter.text = document.createTextNode(letter);
    this.letter.appendChild(this.letter.text);
    changed = true;
  } else if (this.letter.text.data != letter) {
    this.letter.text.data = letter;
    changed = true;
  }
  this.displayedLetter = letter;

  if (color != undefined) {
    if (color != this.base_color || changed) {
      var now = new Date().getTime() / 1000;
      this.td.style.background = color;
      this.color_set_time = now;
      Globals.widget.last_change_time = now;
    }
    this.base_color = color;
  }
  this.setClassName();
};

// vim: set ts=2 sw=2 et ai :

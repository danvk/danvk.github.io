// 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4'

// to make the page load faster during development
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

calcDDTable.cache = { "N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4": { "N": { "N": 3, "S": 3, "E": 9, "W": 9 }, "S": { "N": 5, "S": 5, "E": 8, "W": 8 }, "H": { "N": 3, "S": 3, "E": 9, "W": 9 }, "D": { "N": 6, "S": 6, "E": 7, "W": 7 }, "C": { "N": 3, "S": 3, "E": 9, "W": 9 } } };

var Board = (function () {
  function Board(pbn, strain) {
    _classCallCheck(this, Board);

    this.cards = parsePBN(pbn); // remaining cards in hands
    this.lastTrickPBN = pbn;
    this.firstPlayer = pbn[0]; // first to play comes directly from PBN.
    this.strain = strain; // e.g. spades or no trump ('H', 'S', 'N', ...)
    this.player = this.firstPlayer; // next to play
    this.plays = []; // plays in this trick
    this.tricks = []; // previous tricks. Array of CompleteTrick.
    this.ew_tricks = 0;
    this.ns_tricks = 0;
  }

  _createClass(Board, [{
    key: "leader",
    value: function leader() {
      return this.plays.length ? this.plays[0].player : this.player;
    }

    // Play a card
  }, {
    key: "play",
    value: function play(player, suit, rank) {
      if (player != this.player) {
        throw 'Played out of turn';
      }
      var holding = this.cards[player][suit];
      var idx = holding.indexOf(rank);
      if (idx == -1) {
        throw player + " tried to play " + rank + " " + suit + " which was not in hand.";
      }
      var legalPlays = this.legalPlays();
      if (!_.find(legalPlays, { player: player, suit: suit, rank: rank })) {
        throw suit + " " + rank + " by " + player + " does not follow suit.";
      }

      this.cards[player][suit].splice(idx, 1);
      this.plays.push({ player: player, suit: suit, rank: rank });
      if (this.plays.length == 4) {
        this.sweep();
      } else {
        this.player = NEXT_PLAYER[player];
      }
    }

    // A trick has been completed. Determine the winner and advance the state.
  }, {
    key: "sweep",
    value: function sweep() {
      if (this.plays.length != 4) {
        throw 'Tried to sweep incomplete trick';
      }
      var topSuit = this.plays[0].suit,
          topRank = this.plays[0].rank,
          winner = this.plays[0].player;
      for (var i = 1; i < 4; i++) {
        var _plays$i = this.plays[i];
        var suit = _plays$i.suit;
        var rank = _plays$i.rank;
        var player = _plays$i.player;

        if (suit == topSuit && rank > topRank || suit == this.strain && topSuit != this.strain) {
          topSuit = suit;
          topRank = rank;
          winner = player;
        }
      }

      var trick = {
        plays: this.plays,
        leader: this.plays[0].player,
        winner: winner
      };
      this.tricks.push(trick);
      this.plays = [];
      this.player = winner;
      if (winner == 'N' || winner == 'S') {
        this.ns_tricks++;
      } else {
        this.ew_tricks++;
      }
      this.lastTrickPBN = this.toPBN();
    }

    // Returns an array of {player, suit, rank} objects.
    // TODO: replace this with a call to nextPlays()
  }, {
    key: "legalPlays",
    value: function legalPlays() {
      var player = this.player;
      var followSuit = this.plays.length ? this.plays[0].suit : null;
      if (followSuit && this.cards[player][followSuit].length == 0) {
        followSuit = null;
      }

      var cards = this.cardsForPlayer(player);
      if (followSuit) {
        cards = cards.filter(function (_ref2) {
          var suit = _ref2.suit;
          return suit == followSuit;
        });
      }
      return cards.map(function (_ref3) {
        var suit = _ref3.suit;
        var rank = _ref3.rank;
        return { player: player, suit: suit, rank: rank };
      });
    }

    // Interface to dds.js
  }, {
    key: "nextPlays",
    value: (function (_nextPlays) {
      function nextPlays() {
        return _nextPlays.apply(this, arguments);
      }

      nextPlays.toString = function () {
        return _nextPlays.toString();
      };

      return nextPlays;
    })(function () {
      return nextPlays(this.lastTrickPBN, this.strain, this.plays.map(formatCard));
    })

    // Returns an array of {suit, rank} objects.
  }, {
    key: "cardsForPlayer",
    value: function cardsForPlayer(player) {
      var cards = this.cards[player];
      return _.flatten(_.map(cards, function (ranks, suit) {
        return ranks.map(function (rank) {
          return { suit: suit, rank: rank };
        });
      }));
    }
  }, {
    key: "getDeclarer",
    value: function getDeclarer() {
      return NEXT_PLAYER[NEXT_PLAYER[NEXT_PLAYER[this.firstPlayer]]];
    }

    // Undo the last play
  }, {
    key: "undo",
    value: function undo() {
      var prevTricks = this.tricks.length,
          plays = this.plays.length;

      if (plays == 0) {
        if (prevTricks == 0) {
          throw 'Cannot undo play when no plays have occurred.';
        } else {
          prevTricks -= 1;
          plays = 3;
        }
      } else {
        plays--;
      }
      this.undoToPlay(prevTricks, plays);
    }

    // Undo to a previous position.
    // trickNum \in 0..12
    // playNum \in 0..3
  }, {
    key: "undoToPlay",
    value: function undoToPlay(trickNum, playNum) {
      // gather all the cards that have been played
      var cards = _.flatten(this.tricks.map(function (trick) {
        return trick.plays;
      }));
      cards = cards.concat(this.plays);

      // restore cards to hands
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = cards[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _step.value;
          var player = _step$value.player;
          var suit = _step$value.suit;
          var rank = _step$value.rank;

          this.cards[player][suit].push(rank);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.sortHands();

      // reset tricks & player
      this.player = this.firstPlayer;
      this.tricks = [];
      this.plays = [];
      this.ew_tricks = 0;
      this.ns_tricks = 0;
      this.lastTrickPBN = this.toPBN();

      // replay until the appropriate point
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = cards[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _step2.value;
          var player = _step2$value.player;
          var suit = _step2$value.suit;
          var rank = _step2$value.rank;

          if (this.tricks.length == trickNum && this.plays.length == playNum) {
            break;
          }
          this.play(player, suit, rank);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: "indexForCard",
    value: function indexForCard(suit, rank) {
      for (var i = 0; i < this.tricks.length; i++) {
        var plays = this.tricks[i].plays;
        for (var j = 0; j < plays.length; j++) {
          var card = plays[j];
          if (card.suit == suit && card.rank == rank) {
            return [i, j];
          }
        }
      }

      for (var j = 0; j < this.plays.length; j++) {
        var card = this.plays[j];
        if (card.suit == suit && card.rank == rank) {
          return [i, j];
        }
      }

      throw "Couldn't find played card " + rank + " " + suit;
    }
  }, {
    key: "undoToCard",
    value: function undoToCard(suit, rank) {
      var _indexForCard = this.indexForCard(suit, rank);

      var _indexForCard2 = _slicedToArray(_indexForCard, 2);

      var trickNum = _indexForCard2[0];
      var playNum = _indexForCard2[1];

      this.undoToPlay(trickNum, playNum);
    }

    // Sort all holdings from highest to lowest rank
  }, {
    key: "sortHands",
    value: function sortHands() {
      for (var player in this.cards) {
        for (var suit in this.cards[player]) {
          this.cards[player][suit].sort(function (a, b) {
            return b - a;
          });
        }
      }
    }
  }, {
    key: "toPBN",
    value: function toPBN() {
      var player = this.player;
      var holdings = [];
      for (var i = 0; i < 4; i++) {
        var hand = this.cards[player];
        holdings.push(['S', 'H', 'D', 'C'].map(function (suit) {
          return hand[suit].map(rankToText).join('');
        }).join('.'));
        player = NEXT_PLAYER[player];
      }
      return this.player + ':' + holdings.join(' ');
    }
  }]);

  return Board;
})();

function textToRank(txt) {
  if (txt.length != 1) {
    throw 'Invalid card symbol: ' + txt;
  }
  if (txt >= '2' && txt <= '9') return Number(txt);
  if (txt == 'T') return 10;
  if (txt == 'J') return 11;
  if (txt == 'Q') return 12;
  if (txt == 'K') return 13;
  if (txt == 'A') return 14;
  throw 'Invalid card symbol: ' + txt;
}

function rankToText(rank) {
  if (rank < 10) return String(rank);else if (rank == 10) return 'T';else if (rank == 11) return 'J';else if (rank == 12) return 'Q';else if (rank == 13) return 'K';else if (rank == 14) return 'A';
  throw 'Invalid card rank: ' + rank;
}

// Returns a 2-character string like "QD" or "TH"
function formatCard(card) {
  return rankToText(card.rank) + card.suit;
}

function onSameTeam(a, b) {
  return a == b || NEXT_PLAYER[NEXT_PLAYER[a]] == b;
}

var SUITS = ['S', 'H', 'D', 'C'];

var NEXT_PLAYER = {
  'N': 'E',
  'E': 'S',
  'S': 'W',
  'W': 'N'
};
var PLAYER_TO_ARROW = {
  'N': '⬆',
  'W': '⬅',
  'S': '⬇',
  'E': '➡'
};

// Given a PBN string, return a player -> string holding mapping, e.g.
// {N: 'AKQJ.984...', ...}
function parsePBNStrings(pbn) {
  var parts = pbn.split(' ');
  if (parts.length != 4) {
    throw 'PBN must have four hands (got ' + parts.length + ')';
  }

  var m = parts[0].match(/^([NSEW]):/);
  if (!m) {
    throw 'PBN must start with either "N:", "S:", "E:" or "W:"';
  }
  parts[0] = parts[0].slice(2);
  var player = m[1];
  var hands = {};
  parts.forEach(function (txt, i) {
    hands[player] = txt;
    player = NEXT_PLAYER[player];
  });
  return hands;
}

function parsePBN(pbn) {
  var textHands = parsePBNStrings(pbn);

  var deal = {};
  _.each(textHands, function (txt, player) {
    deal[player] = {};
    var suits = txt.split('.');
    if (suits.length != 4) {
      throw player + " must have four suits, got " + suits.length + ": " + txt;
    }
    suits.forEach(function (holding, idx) {
      deal[player][SUITS[idx]] = [].map.call(holding, textToRank);
    });
  });
  return deal;
}

// Rotate the PBN string so that firstPlayer is first.
function rotatePBN(pbn, firstPlayer) {
  if (firstPlayer.length != 1 || 'NSEW'.indexOf(firstPlayer) == -1) {
    throw "Invalid player: " + firstPlayer;
  }
  var textHands = parsePBNStrings(pbn);
  var player = firstPlayer;
  var hands = [];
  do {
    hands.push(textHands[player]);
    player = NEXT_PLAYER[player];
  } while (player != firstPlayer);
  return firstPlayer + ':' + hands.join(' ');
}

var SUIT_SYMBOLS = {
  'S': '♠',
  'H': '♥',
  'D': '♦',
  'C': '♣'
};

/**
 * props:
 *   suit: {'S', 'H', 'D', 'C'}
 *   rank: {'1'..'9', 'T', 'J', 'Q', 'K', 'A'}
 *   making: null | number
 *   facedown: {false, true}
 *   onClick: (suit: string, rank: number) => void
 */

var Card = (function (_React$Component) {
  _inherits(Card, _React$Component);

  function Card() {
    _classCallCheck(this, Card);

    _get(Object.getPrototypeOf(Card.prototype), "constructor", this).apply(this, arguments);
  }

  /**
   * props:
   *   hand: { 'S': [4, 9, 13], ... }
   *   enable: 'all' | 'S' | 'H' | 'C' | 'D' | 'none'
   *   oneRow: boolean
   *   making: [{rank, suit, score}]
   *   onClick: (suit: string, rank: number) => void
   */

  _createClass(Card, [{
    key: "handleClick",
    value: function handleClick() {
      if (this.props.onClick) {
        this.props.onClick(this.props.suit, this.props.rank);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var suit = this.props.suit;
      var suitSym = SUIT_SYMBOLS[suit];
      var rankSym = this.props.rank;
      if (rankSym == 'T') rankSym = '10';
      if (rankSym == 11) rankSym = 'J';
      if (rankSym == 12) rankSym = 'Q';
      if (rankSym == 13) rankSym = 'K';
      if (rankSym == 14) rankSym = 'A';
      var className = 'card' + (this.props.className ? ' ' + this.props.className : '');
      if (this.props.facedown) {
        return React.createElement(
          "div",
          { className: className + ' facedown' },
          React.createElement(
            "span",
            { className: "rank" },
            " "
          ),
          React.createElement(
            "span",
            { className: "suit" },
            " "
          )
        );
      } else {
        return React.createElement(
          "div",
          { className: className, onClick: this.handleClick.bind(this) },
          React.createElement(
            "span",
            { className: "rank" },
            rankSym
          ),
          React.createElement(
            "span",
            { className: 'suit suit-' + suit },
            suitSym
          ),
          React.createElement(
            "span",
            { className: "making" },
            this.props.making
          )
        );
      }
    }
  }]);

  return Card;
})(React.Component);

var Hand = (function (_React$Component2) {
  _inherits(Hand, _React$Component2);

  function Hand() {
    _classCallCheck(this, Hand);

    _get(Object.getPrototypeOf(Hand.prototype), "constructor", this).apply(this, arguments);
  }

  /**
   * props:
   *   plays: [{suit: 'S', rank: 14}, ...]
   *   lead: 'W' | ...
   *   winner: null | 'W' | ...
   *   showArrow: true | false
   *   onClick: (suit: string, rank: number) => void
   */

  _createClass(Hand, [{
    key: "handleClick",
    value: function handleClick(suit, rank) {
      var enable = this.props.enable || 'all';
      if (this.props.onClick && (enable == 'all' || enable == suit)) {
        this.props.onClick(suit, rank);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var click = this.handleClick.bind(this);
      var making = _.mapObject(_.groupBy(this.props.making, 'suit'), function (vs) {
        return _.object(vs.map(function (_ref4) {
          var rank = _ref4.rank;
          var score = _ref4.score;
          return [rank, score];
        }));
      });
      var cards = {};
      for (var suit in this.props.hand) {
        var holding = this.props.hand[suit];
        var mkSuit = making[suit] || {};
        cards[suit] = holding.map(function (rank) {
          return React.createElement(Card, { key: rank,
            suit: suit,
            rank: rank,
            making: mkSuit[rank],
            onClick: click });
        });
      }
      var sep = this.props.oneRow ? ' ' : React.createElement("br", null);
      var enable = this.props.enable || 'all';
      var d = enable == 'all' ? true : false;
      var enabled = { 'S': d, 'H': d, 'C': d, 'D': d };
      if (enable in enabled) {
        enabled[enable] = true;
      }
      var suitClass = {};
      for (var k in enabled) {
        suitClass[k] = 'suit ' + (enabled[k] ? 'enable' : 'disabled');
      }
      return React.createElement(
        "div",
        { className: "hand" },
        React.createElement(
          "div",
          { className: suitClass['S'] },
          cards['S']
        ),
        sep,
        React.createElement(
          "div",
          { className: suitClass['H'] },
          cards['H']
        ),
        sep,
        React.createElement(
          "div",
          { className: suitClass['C'] },
          cards['C']
        ),
        sep,
        React.createElement(
          "div",
          { className: suitClass['D'] },
          cards['D']
        )
      );
    }
  }]);

  return Hand;
})(React.Component);

var Trick = (function (_React$Component3) {
  _inherits(Trick, _React$Component3);

  function Trick() {
    _classCallCheck(this, Trick);

    _get(Object.getPrototypeOf(Trick.prototype), "constructor", this).apply(this, arguments);
  }

  /**
   * props:
   *   deal: (parsed PBN)
   *   plays: [{suit: 'S', rank: 14}, ...]
   *   leader: 'W'
   *   legalSuit: 'all' | 'S' | 'H' | 'C' | 'D'
   *   making: {player: [{rank, suit, score}]}
   *   onClick: (player: string, suit: string, rank: number) => void
   *   onUndo: (player: string, suit: string, rank: number) => void
   *
   * TODO: kill legalSuit and use only `making`
   */

  _createClass(Trick, [{
    key: "handleClick",
    value: function handleClick(player, suit, rank) {
      if (this.props.onClick) {
        this.props.onClick(player, suit, rank);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      // Matches size of a card
      var spacer = React.createElement("div", { style: { width: '22px', height: '38px' } });
      var playerToCard = { N: spacer, S: spacer, E: spacer, W: spacer };
      var player = this.props.leader;
      var makeClick = function makeClick(player) {
        return _this.handleClick.bind(_this, player);
      };
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.props.plays[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var card = _step3.value;

          var className = player == this.props.leader ? 'lead' : null;
          playerToCard[player] = React.createElement(Card, { rank: card.rank,
            suit: card.suit,
            className: className,
            onClick: makeClick(player) });
          player = NEXT_PLAYER[player];
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var arrow = this.props.showArrow ? PLAYER_TO_ARROW[player] : ' ';

      return React.createElement(
        "table",
        { className: "trick" },
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: 3, className: "north-trick" },
              playerToCard['N']
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { className: "west-trick" },
              playerToCard['W']
            ),
            React.createElement(
              "td",
              null,
              arrow
            ),
            React.createElement(
              "td",
              { className: "east-trick" },
              playerToCard['E']
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: 3, className: "south-trick" },
              playerToCard['S']
            )
          )
        )
      );
    }
  }]);

  return Trick;
})(React.Component);

var Deal = (function (_React$Component4) {
  _inherits(Deal, _React$Component4);

  function Deal() {
    _classCallCheck(this, Deal);

    _get(Object.getPrototypeOf(Deal.prototype), "constructor", this).apply(this, arguments);
  }

  /**
   * props:
   *   matrix: Output of calcDDTable()
   *   strain: currently selected strain
   *   declarer: currently selected declarer
   *   onClick: (strain: string, declarer: string) => void
   */

  _createClass(Deal, [{
    key: "handleClick",
    value: function handleClick(player, suit, rank) {
      if (this.props.onClick) {
        this.props.onClick(player, suit, rank);
      }
    }
  }, {
    key: "handleUndo",
    value: function handleUndo(player, suit, rank) {
      if (this.props.onUndo) {
        this.props.onUndo(player, suit, rank);
      }
    }
  }, {
    key: "getEnables",
    value: function getEnables() {
      var enables = { 'N': 'none', 'E': 'none', 'S': 'none', 'W': 'none' };
      var player = this.props.leader;
      for (var i = 0; i < this.props.plays.length; i++) {
        player = NEXT_PLAYER[player];
      }
      enables[player] = this.props.legalSuit;
      return enables;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var d = this.props.deal;
      var makeClick = function makeClick(player) {
        return _this2.handleClick.bind(_this2, player);
      };
      var enables = this.getEnables();
      var making = this.props.making;
      return React.createElement(
        "table",
        { className: "deal" },
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: 3, className: "north", style: { 'textAlign': 'center' } },
              React.createElement(Hand, { oneRow: true, hand: d.N, enable: enables.N, making: making.N, onClick: makeClick('N') }),
              React.createElement(
                "div",
                { className: "player-label" },
                "North"
              )
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { className: "west" },
              React.createElement(
                "div",
                null,
                React.createElement(Hand, { hand: d.W, enable: enables.W, making: making.W, onClick: makeClick('W') })
              ),
              React.createElement(
                "div",
                { className: "player-label" },
                "W",
                React.createElement("br", null),
                "e",
                React.createElement("br", null),
                "s",
                React.createElement("br", null),
                "t"
              )
            ),
            React.createElement(
              "td",
              { className: "plays" },
              React.createElement(Trick, { showArrow: true, plays: this.props.plays, leader: this.props.leader, onClick: this.handleUndo.bind(this) })
            ),
            React.createElement(
              "td",
              { className: "east" },
              React.createElement(
                "div",
                { className: "player-label" },
                "E",
                React.createElement("br", null),
                "a",
                React.createElement("br", null),
                "s",
                React.createElement("br", null),
                "t"
              ),
              React.createElement(
                "div",
                null,
                React.createElement(Hand, { hand: d.E, enable: enables.E, making: making.E, onClick: makeClick('E') })
              )
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { colSpan: 3, className: "south", style: { 'textAlign': 'center' } },
              React.createElement(
                "div",
                { className: "player-label" },
                "South"
              ),
              React.createElement(Hand, { oneRow: true, hand: d.S, enable: enables.S, making: making.S, onClick: makeClick('S') })
            )
          )
        )
      );
    }
  }]);

  return Deal;
})(React.Component);

var DDMatrix = (function (_React$Component5) {
  _inherits(DDMatrix, _React$Component5);

  function DDMatrix() {
    _classCallCheck(this, DDMatrix);

    _get(Object.getPrototypeOf(DDMatrix.prototype), "constructor", this).apply(this, arguments);
  }

  /**
   * props:
   * - board
   * - onChange
   */

  _createClass(DDMatrix, [{
    key: "handleClick",
    value: function handleClick(strain, player) {
      if (this.props.onClick) {
        this.props.onClick(strain, player);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var m = this.props.matrix;
      var ud = function ud(num) {
        return num >= 7 ? 'up' : 'down';
      };
      var makeCell = function makeCell(strain, player) {
        var tricks = m[strain][player];
        var selected = strain == _this3.props.strain && player == _this3.props.declarer;
        var className = [ud(tricks)].concat(selected ? ['selected'] : []).join(' ');
        var clickFn = _this3.handleClick.bind(_this3, strain, player);
        return React.createElement(
          "td",
          { key: strain + player, className: className, onClick: clickFn },
          tricks
        );
      };

      var rows = ['N', 'S', 'E', 'W'].map(function (player) {
        return React.createElement(
          "tr",
          { key: player },
          React.createElement(
            "td",
            null,
            player
          ),
          makeCell('N', player),
          makeCell('S', player),
          makeCell('H', player),
          makeCell('D', player),
          makeCell('C', player)
        );
      });

      return React.createElement(
        "table",
        { className: "dd-matrix" },
        React.createElement(
          "tbody",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement(
              "th",
              null,
              ' '
            ),
            React.createElement(
              "th",
              { className: "suit suit-N" },
              "NT"
            ),
            React.createElement(
              "th",
              { className: "suit suit-S" },
              "♠"
            ),
            React.createElement(
              "th",
              { className: "suit suit-H" },
              "♥"
            ),
            React.createElement(
              "th",
              { className: "suit suit-D" },
              "♦"
            ),
            React.createElement(
              "th",
              { className: "suit suit-C" },
              "♣"
            )
          ),
          rows
        )
      );
    }
  }]);

  return DDMatrix;
})(React.Component);

var Explorer = (function (_React$Component6) {
  _inherits(Explorer, _React$Component6);

  function Explorer(props) {
    _classCallCheck(this, Explorer);

    _get(Object.getPrototypeOf(Explorer.prototype), "constructor", this).call(this, props);
  }

  // Given a file object from a FileList, return a Promise for an
  // HTMLImageElement.

  _createClass(Explorer, [{
    key: "handleClick",
    value: function handleClick(player, suit, rank) {
      var board = this.props.board;
      board.play(player, suit, rank);
      this.forceUpdate();
      if (this.props.onChange) this.props.onChange();
    }
  }, {
    key: "handleUndo",
    value: function handleUndo(player, suit, rank) {
      this.props.board.undoToCard(suit, rank);
      this.forceUpdate();
      if (this.props.onChange) this.props.onChange();
    }

    // Returns a {player -> [{suit, rank, score}, ...]} object.
    // score is tricks available to the declarer after each play.
  }, {
    key: "getMaking",
    value: function getMaking(board) {
      var data = board.nextPlays();
      var player = data.player;
      var makingPlays = _.flatten(data.plays.map(function (_ref5) {
        var suit = _ref5.suit;
        var rank = _ref5.rank;
        var score = _ref5.score;
        var equals = _ref5.equals;

        return [{ suit: suit, rank: rank, score: score }].concat(equals.map(function (rank) {
          return { suit: suit, rank: rank, score: score };
        }));
      })).map(function (_ref6) {
        var suit = _ref6.suit;
        var rank = _ref6.rank;
        var score = _ref6.score;
        return { suit: suit, rank: textToRank(rank), score: score };
      });
      makingPlays.forEach(function (play) {
        if (onSameTeam(player, board.getDeclarer())) {
          play.score += player == 'E' || player == 'W' ? board.ew_tricks : board.ns_tricks;
        } else {
          play.score += player == 'E' || player == 'W' ? board.ew_tricks : board.ns_tricks;
          play.score = 13 - play.score;
        }
      });

      return _defineProperty({}, player, makingPlays);
    }
  }, {
    key: "render",
    value: function render() {
      var board = this.props.board;
      var handleUndo = this.handleUndo.bind(this);
      var prevTricks = board.tricks.map(function (trick, i) {
        return React.createElement(Trick, { key: i,
          plays: trick.plays,
          leader: trick.leader,
          winner: trick.winner,
          onClick: handleUndo });
      });
      var legalPlays = board.legalPlays();
      var legalSuits = _.uniq(_.pluck(legalPlays, 'suit'));
      var legalSuit = legalSuits.length == 1 ? legalSuits[0] : 'all';

      var making = this.getMaking(board);

      return React.createElement(
        "div",
        null,
        React.createElement(Deal, { deal: board.cards,
          plays: board.plays,
          leader: board.leader(),
          legalSuit: legalSuit,
          making: making,
          onClick: this.handleClick.bind(this),
          onUndo: handleUndo
        }),
        React.createElement(
          "div",
          { className: "score" },
          React.createElement(
            "p",
            null,
            board.ns_tricks,
            " North-South"
          ),
          React.createElement(
            "p",
            null,
            board.ew_tricks,
            " East-West"
          )
        ),
        React.createElement(
          "div",
          { className: "previous-tricks" },
          prevTricks
        )
      );
    }
  }]);

  return Explorer;
})(React.Component);

function loadUploadedImage(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onloadend = function () {
      var image = new Image();
      image.onload = function () {
        var width = image.width,
            height = image.height;
        console.log('Image dimensions: ', width, 'x', height);
        resolve(image);
      };

      image.onerror = function () {
        console.error('There was an error processing your file!');
        reject('There was an error processing your file!');
      };

      image.src = reader.result;
    };
    reader.onerror = function () {
      console.error('There was an error reading the file!');
      reject('There was an error reading the file!');
    };

    reader.readAsDataURL(file);
  });
}

/**
 * props:
 *   initialPBN
 *   initialDeclarer
 *   initialStrain
 *   initialPlays
 */

var Root = (function (_React$Component7) {
  _inherits(Root, _React$Component7);

  function Root(props) {
    _classCallCheck(this, Root);

    _get(Object.getPrototypeOf(Root.prototype), "constructor", this).call(this, props);
    this.state = {
      pbn: props.initialPBN,
      strain: props.initialStrain,
      declarer: props.initialDeclarer
    };
    this.board = this.makeBoard(this.state);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = props.initialPlays[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var play = _step4.value;

        this.board.play(this.board.player, play.suit, play.rank);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  // Via http://stackoverflow.com/a/2880929/388951

  // Update in response to form changes.

  _createClass(Root, [{
    key: "handleFormSubmit",
    value: function handleFormSubmit(e) {
      e.preventDefault();
      this.setState({
        pbn: this.refs.pbn.value
      });
    }
  }, {
    key: "handleUpload",
    value: function handleUpload(e) {
      var _this4 = this;

      var file = e.target.files[0];
      Promise.all([ibb.loadReferenceData('ibb/ns-black.png', 'ibb/ns-red.png'), loadUploadedImage(file)]).then(function (_ref7) {
        var _ref72 = _slicedToArray(_ref7, 2);

        var ref = _ref72[0];
        var img = _ref72[1];

        var hand = ibb.recognizeHand(img, ref);
        if (hand.errors.length) {
          console.warn('Unable to recognize iBridgeBaron hand', hand.errors);
          return;
        }

        _this4.setState({ pbn: hand.pbn });
      })["catch"](function (error) {
        alert(error);
      });
    }
  }, {
    key: "handleDDClick",
    value: function handleDDClick(strain, declarer) {
      this.setState({ strain: strain, declarer: declarer });
    }
  }, {
    key: "makeBoard",
    value: function makeBoard(state) {
      var pbn = rotatePBN(state.pbn, NEXT_PLAYER[state.declarer]);
      return new Board(pbn, state.strain);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateUI();
    }
  }, {
    key: "componentWillUpdate",
    value: function componentWillUpdate(nextProps, nextState) {
      this.board = this.makeBoard(nextState);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.updateUI();
    }
  }, {
    key: "updateUI",
    value: function updateUI() {
      this.refs.pbn.value = this.state.pbn;
      this.setURL();
    }
  }, {
    key: "setURL",
    value: function setURL() {
      var board = this.board;
      var plays = _.flatten(board.tricks.map(function (t) {
        return t.plays;
      }).concat(board.plays));
      var params = {
        strain: this.state.strain,
        declarer: this.state.declarer,
        plays: plays.map(function (_ref8) {
          var suit = _ref8.suit;
          var rank = _ref8.rank;
          return rankToText(rank) + suit;
        }).join(','),
        deal: this.state.pbn
      };
      var queryString = _.map(params, function (v, k) {
        return k + '=' + v;
      }).join('&');
      history.replaceState({}, '', '?' + queryString.replace(/ /g, '+'));
    }
  }, {
    key: "boardDidUpdate",
    value: function boardDidUpdate() {
      this.setURL();
    }
  }, {
    key: "render",
    value: function render() {
      var handleFormSubmit = this.handleFormSubmit.bind(this),
          handleUpload = this.handleUpload.bind(this);
      return React.createElement(
        "div",
        null,
        React.createElement(
          "form",
          { onSubmit: handleFormSubmit },
          "PBN: ",
          React.createElement("input", { type: "text", size: "70", ref: "pbn" })
        ),
        React.createElement(
          "form",
          { onChange: handleUpload },
          "iBridgeBaron: ",
          React.createElement("input", { ref: "ibb", type: "file", accept: "image/*" })
        ),
        React.createElement(DDMatrix, { matrix: calcDDTable(this.state.pbn),
          declarer: this.state.declarer,
          strain: this.state.strain,
          onClick: this.handleDDClick.bind(this) }),
        React.createElement(Explorer, { board: this.board,
          onChange: this.boardDidUpdate.bind(this) })
      );
    }
  }]);

  return Root;
})(React.Component);

function parseQueryString() {
  var match,
      pl = /\+/g,
      // Regex for replacing addition symbol with a space
  search = /([^&=]+)=?([^&]*)/g,
      decode = function decode(s) {
    return decodeURIComponent(s.replace(pl, " "));
  },
      query = window.location.search.substring(1);

  var urlParams = {};
  while (match = search.exec(query)) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
}

function parsePlays(playsStr) {
  if (!playsStr) return [];
  return playsStr.split(',').map(function (play) {
    return {
      rank: textToRank(play[0]),
      suit: play[1]
    };
  });
}

window.parsePBN = parsePBN;
window.rotatePBN = rotatePBN;
window.Board = Board;
window.Root = Root;

var root = document.getElementById('root');
if (root) {
  var params = parseQueryString();
  var pbn = 'N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4' || params.deal.replace(/\+/g, ' ');
  var strain = 'N' || params.strain;
  var declarer = 'W' || params.declarer;
  var plays = parsePlays(params.plays) || [];
  console.log(params);
  console.log(plays);

  ReactDOM.render(React.createElement(Root, { initialPBN: pbn,
    initialStrain: strain,
    initialDeclarer: declarer,
    initialPlays: plays }), root);
}
/**
 * Load the image at `path` (relative to the current page).
 * This returns a Promise for an HTMLImageElement.
 */
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function loadImage(path) {
  return new Promise(function (resolve, reject) {
    var img = document.createElement('img');
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve(c);
    };
    img.src = path;
  });
};

/**
 * Takes a canvas and a key -> [x1, y1, x2, y2] mapping.
 * Returns a key -> canvas mapping with the sliced images.
 * Slices are inclusive on both ends, e.g. x1=1 x2=2 will produce a 2px wide
 *   slice.
 */
function sliceImage(canvas, boxes) {
  return _.mapObject(boxes, function (box, key) {
    var _box = _slicedToArray(box, 4);

    var x1 = _box[0];
    var y1 = _box[1];
    var x2 = _box[2];
    var y2 = _box[3];

    var sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = x2 - x1 + 1;
    sliceCanvas.height = y2 - y1 + 1;
    var ctx = sliceCanvas.getContext('2d');
    ctx.drawImage(canvas, x1, y1, x2 - x1 + 1, y2 - y1 + 1, 0, 0, x2 - x1 + 1, y2 - y1 + 1);
    return sliceCanvas;
  });
};

/**
 * takes a canvas and returns a 1d array of whether pixels are foreground.
 * "foreground" is very specific to iBridgeBaron screenshots.
 */
function binarize(canvas) {
  var out = Array(canvas.width * canvas.height);
  var w = canvas.width,
      h = canvas.height,
      d = canvas.getContext('2d').getImageData(0, 0, w, h).data;

  for (var i = 0, n = 0; i < d.length; i += 4, n++) {
    var r = d[i + 0],
        g = d[i + 1],
        b = d[i + 2];

    // 0,0,0 = black
    // 232,236,196 = background
    // 229,0,28 = red
    var blackErr = (r + g + b) / 3,
        redErr = (Math.abs(r - 229) + g + Math.abs(b - 28)) / 3;

    // 231, 87, 84 = red  2 + 87 + 56  => 145/3 ~= 48
    // 229, 15, 34 = red  0 + 15 + 6  => 21/3 = 7
    // 236, 220, 187 = bad  7 + 220 + 159

    // 26, 26, 23 = black
    // 13, 13, 11 = black

    // 136, 134, 113 = bad

    out[n] = blackErr < 30 || redErr < 50 ? 1 : 0;
  }

  // clear out a 4x4 area around each corner. If there's anything there, it's
  // likely to be an artifact.
  var zero = function zero(x, y) {
    out[w * y + x] = 0;
  };
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      zero(x, y);
      zero(w - 1 - x, y);
      zero(x, h - 1 - y);
      zero(w - 1 - x, h - 1 - y);
    }
  }

  return out;
}

/**
 * Returns a new binary array which is 1 where a and b differ.
 */
function binaryDiff(a, b) {
  if (a.length != b.length) {
    throw 'Length mismatch: ' + a.length + ' != ' + b.length;
  }

  var d = Array(a.length);
  for (var i = 0; i < a.length; i++) {
    d[i] = a[i] != b[i] ? 1 : 0;
  }
  return d;
}

/**
 * Given a binary array (e.g. output of binarize()), return a B&W canvas.
 */
function binaryToCanvas(pixels, width) {
  if (!(width > 0)) {
    throw 'Invalid width: ' + width;
  }
  if (pixels.length % width != 0) {
    throw 'Invalid width: ' + width + ' does not divide ' + pixels.length;
  }
  var canvas = document.createElement('canvas');
  var height = pixels.length / width;
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(width, height);
  var d = imageData.data;
  for (var i = 0, n = 0; i < pixels.length; i++, n += 4) {
    var v = pixels[i] ? 0 : 255;
    d[n] = d[n + 1] = d[n + 2] = v;
    d[n + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Shift a binary array representing an image by (dx, dy).
 * Returns a new array, leaving the original untouched.
 */
function binaryShift(pixels, width, dx, dy) {
  if (!(width > 0)) {
    throw 'Invalid width: ' + width;
  }
  if (pixels.length % width != 0) {
    throw 'Invalid width: ' + width + ' does not divide ' + pixels.length;
  }
  var height = pixels.length / width;
  var out = Array(pixels.length);
  for (var i = 0; i < out.length; i++) out[i] = 0;

  for (var y = 0; y < height; y++) {
    var ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    for (var x = 0; x < width; x++) {
      var nx = x + dx;
      if (nx < 0 || nx >= width) continue;
      out[ny * width + nx] = pixels[y * width + x];
    }
  }
  return out;
}

/**
 * Calculates the RMSE between two arrays.
 */
function rmse(arr1, arr2) {
  if (arr1.length != arr2.length) {
    throw 'Size mismatch ' + arr1.length + ' != ' + arr2.length;
  }

  var mse = 0,
      n = arr1.length;
  for (var i = 0; i < n; i++) {
    var v = arr1[i] - arr2[i];
    mse += v * v;
  }
  mse /= n;
  return Math.sqrt(mse);
};

/**
 * Find the best matches according to RMSE
 *
 * targets = Array<{
 *   pixels: number[],
 *   shifts?: Array<number[]>
 *   width: number,
 *   ...
 * }>
 *
 * If `shifts` is present, only the lowest RMSE shift is considered.
 */
function bestMatches(pixels, targets) {
  var scores = targets.map(function (target) {
    var score = target.shifts ? _.min(target.shifts.map(function (shift) {
      return rmse(pixels, shift);
    })) : rmse(pixels, target.pixels);
    return _.extend({}, target, { rmse: score });
  });
  return _.sortBy(scores, 'rmse');
}

/**
 * Returns the margin by which scores[0].rmse is the best, excluding others for
 * which scores[*].property is identical to scores[0].property.
 */
function marginBy(scores, property) {
  var best = scores[0].rmse,
      secondBest = _.find(scores, function (s) {
    return s[property] != scores[0][property];
  }).rmse;
  return (secondBest - best) / best;
}

// Convert a numeric rank to a single character PBN rank (e.g. 10 --> 'T').
function rankToPBN(rank) {
  if (rank >= 2 && rank < 10) return '' + rank;else if (rank == 10) return 'T';else if (rank == 11) return 'J';else if (rank == 12) return 'Q';else if (rank == 13) return 'K';else if (rank == 14) return 'A';
  throw 'Invalid rank: ' + rank;
}

// value order for the suits
var SUIT_ORDER = { 'S': 0, 'H': 1, 'D': 2, 'C': 3 };

// Performs sanity checks on the matches structure in recognizeHand.
// - are all the cards accounted for?
// - are the hands correctly ordered?
// Returns a list of errors (or the empty list if it checks out).
function sanityCheckMatches(matches) {
  var errors = [];
  // Are all the cards matched exactly once?
  var cardCounts = {}; // e.g. AS
  for (var suit in SUIT_ORDER) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _.range(2, 15)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var rank = _step.value;

        cardCounts[rankToPBN(rank) + suit] = [];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  for (var playerPos in matches) {
    var player = playerPos[0],
        pos = Number(playerPos.slice(1)),
        match = matches[playerPos],
        suit = match.suit,
        rank = match.rank;
    cardCounts[rankToPBN(rank) + suit].push(playerPos);
  }

  for (var card in cardCounts) {
    var count = cardCounts[card].length;
    if (count == 0) {
      errors.push('Missing ' + card);
    } else if (count > 1) {
      var holders = cardCounts[card].join(', ');
      errors.push('Multiple matches of ' + card + ' (' + holders + ')');
    }
  }

  // Is everyone's hand in order?
  // There is no firm ordering of the suits. If a trump suit is set, then the
  // hands are re-ordered to put it first.
  var _arr = ['N', 'E', 'S', 'W'];
  for (var _i = 0; _i < _arr.length; _i++) {
    var player = _arr[_i];var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _.range(1, 13)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var pos = _step2.value;

        var a = matches[player + (pos - 1)],
            b = matches[player + pos];
        if (a.suit == b.suit && a.rank < b.rank) {
          var aTxt = rankToPBN(a.rank) + a.suit,
              bTxt = rankToPBN(b.rank) + b.suit;
          errors.push(player + ' is out of order: ' + aTxt + ' < ' + bTxt);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
  return errors;
}

// Convert the matches structure (in recognizeHand) to PBN. North is always first.
function matchesToPBN(matches) {
  var holdings = [];
  var _arr2 = ['N', 'E', 'S', 'W'];

  var _loop = function () {
    var player = _arr2[_i2];bySuit = _.chain(_.range(0, 13)).map(function (pos) {
      return matches[player + pos];
    }).groupBy('suit').mapObject(function (cards) {
      return cards.map(function (card) {
        return rankToPBN(card.rank);
      }).join('');
    }).value();

    // looks like {S:'KQT9', H:'9876', ...}

    // We need the empty strings to correctly handle void suits.
    bySuit = _.chain(_.extend({ S: '', H: '', D: '', C: '' }, bySuit)).pairs().sortBy(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var suit = _ref2[0];
      return SUIT_ORDER[suit];
    }).map(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var suit = _ref32[0];
      var text = _ref32[1];
      return text;
    }).join('.').value();
    holdings.push(bySuit);
  };

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var bySuit;

    _loop();
  }
  return 'N:' + holdings.join(' ');
}

// Boxes to split apart the rank and suit.
// Recognition works much better when these are done independently.
var slices = {
  'NS': { 'rank': [0, 0, 51, 59], 'suit': [0, 60, 51, 120] },
  'EW': { 'rank': [0, 0, 41, 50], 'suit': [42, 0, 73, 50] }
};

var cachedReference = {};

/**
 * Load reference data. Returns a promise for the reference.
 */
function loadReferenceData(nsBlackPath, nsRedPath) {
  var cacheKey = nsBlackPath + ' ' + nsRedPath;
  if (cacheKey in cachedReference) {
    return Promise.resolve(cachedReference[cacheKey]);
  }

  return Promise.all([loadImage(nsBlackPath), loadImage(nsRedPath)]).then(function (_ref4) {
    var _ref42 = _slicedToArray(_ref4, 2);

    var blackImage = _ref42[0];
    var redImage = _ref42[1];

    // NS have all the red cards in one image, all the black in the other.
    var nsBlackSuits = { N: 'S', E: 'D', S: 'C', W: 'H' };
    var nsRedSuits = { N: 'H', E: 'C', S: 'D', W: 'S' };

    // This is the reference structure which is returned. It contains examples
    // of what each suit and rank look like in both N/S and E/W positions.
    var ref = {
      'NS': { ranks: [], suits: [] },
      'EW': { ranks: [], suits: [] }
    };

    // Add a single card from one of the reference images to the `ref` object.
    var recordCard = function recordCard(card, position, isNorthBlack) {
      var player = position[0];
      var isNS = player == 'S' || player == 'N',
          side = isNS ? 'NS' : 'EW';
      var posNum = Number(position.slice(1));
      var rank = 14 - posNum;
      var cardSlices = sliceImage(card, slices[side]),
          rankSlice = cardSlices.rank,
          suitSlice = cardSlices.suit;
      var suitPixels = binarize(suitSlice),
          rankPixels = binarize(rankSlice);

      // Only the rank images are shifted. There are enough copies of the suit
      // images that this isn't needed for them. The N/S images are shifted
      // left/right while E/W images are shifted up/down.
      var dx = isNS ? 1 : 0,
          dy = isNS ? 0 : 1;
      var shifts = [binaryShift(rankPixels, rankSlice.width, -dx, -dy), rankPixels, binaryShift(rankPixels, rankSlice.width, +dy, +dy)];
      var suit = isNorthBlack ? nsBlackSuits[player] : nsRedSuits[player];
      var rankEl = { pixels: rankPixels, shifts: shifts, rank: rank, width: rankSlice.width, height: rankSlice.height };
      var suitEl = { suit: suit, pixels: suitPixels, width: suitSlice.width, height: suitSlice.height };

      ref[side].ranks.push(rankEl);
      ref[side].suits.push(suitEl);
    };

    var cardsBlackNorth = sliceImage(blackImage, ibbBoxes6);
    var cardsRedNorth = sliceImage(redImage, ibbBoxes6);
    _.each(cardsBlackNorth, function (card, position) {
      recordCard(card, position, true);
    });
    _.each(cardsRedNorth, function (card, position) {
      recordCard(card, position, false);
    });

    cachedReference[cacheKey] = ref;
    return ref;
  });
}

/**
 * Given a screenshot of an iBridgeBaron hand, attempt to recognize the cards.
 *
 * Returns:
 * {
 *   pbn: string,
 *   margin: number,
 *   errors: string[],
 *   matches: Object[]
 * }
 *
 * Higher margins indicate greater confidence. If errors is non-empty, then the
 * board does not represent a complete hand.
 */
function recognizeHand(handImage, ref) {
  var w = handImage.width,
      h = handImage.height;
  if (w != 750 || h != 1334) {
    throw 'Invalid screenshot: expected 750x1334, got ' + w + 'x' + h;
  }
  console.time('recognizeHand');
  var cards = sliceImage(handImage, ibbBoxes6);

  var matches = {};
  for (var pos in cards) {
    var player = pos[0];
    var isNS = player == 'S' || player == 'N';
    var cardSlices = sliceImage(cards[pos], slices[isNS ? 'NS' : 'EW']),
        rankSlice = cardSlices.rank,
        suitSlice = cardSlices.suit;
    var suitPixels = binarize(suitSlice),
        rankPixels = binarize(rankSlice);
    var refs = isNS ? ref.NS : ref.EW;

    var suitMatches = bestMatches(suitPixels, refs.suits);
    var rankMatches = bestMatches(rankPixels, refs.ranks);

    matches[pos] = {
      suit: suitMatches[0].suit,
      suitStats: {
        rmse: suitMatches[0].rmse,
        margin: marginBy(suitMatches, 'suit')
      },
      rank: rankMatches[0].rank,
      rankStats: {
        rmse: rankMatches[0].rmse,
        margin: marginBy(rankMatches, 'rank')
      }
    };
  }

  var margin = _.min(_.map(matches, function (m) {
    return Math.min(m.suitStats.margin / m.suitStats.rmse, m.rankStats.margin / m.rankStats.rmse);
  }));

  console.timeEnd('recognizeHand');
  return {
    pbn: matchesToPBN(matches),
    margin: margin,
    errors: sanityCheckMatches(matches),
    matches: matches
  };
}

// Export these functions globally for now.
_.extend(window, { ibb: {
    loadImage: loadImage,
    sliceImage: sliceImage,
    rmse: rmse,
    binarize: binarize,
    binaryToCanvas: binaryToCanvas,
    binaryDiff: binaryDiff,
    binaryShift: binaryShift,
    matchesToPBN: matchesToPBN,
    sanityCheckMatches: sanityCheckMatches,
    bestMatches: bestMatches,
    marginBy: marginBy,
    loadReferenceData: loadReferenceData,
    recognizeHand: recognizeHand
  } });

//# sourceMappingURL=all.es5.js.map
// Replace all "null" entries with the higher-ranked player
function fillBracket(matches, winner) {
  var matches = JSON.parse(JSON.stringify(matches));
  for (var i = 1; i < matches.length; i++) {
    var match_list = matches[i];
    for (var j = 0; j < match_list.length; j++) {
      for (var k = 0; k < 2; k++) {
        if (match_list[j][k] == null) {
          var prev_match = matches[i-1][j * 2 + k];
          match_list[j][k] = Math.min(prev_match[0], prev_match[1]);
        }
      }
    }
  }

  var finals = matches[matches.length - 1][0];
  if (winner != finals[0] && winner != finals[1]) {
    winner = Math.min(finals[0], finals[1]);
  }

  return [matches, winner];
}


function nextSlot(i, j, k) {
  return [i + 1, Math.floor(j / 2), j % 2];
}

// Remove a player from the tournament start with a particular round.
function clearPlayer(matches, playerId, startingWithRound) {
  for (var i = startingWithRound; i < matches.length; i++) {
    var match_list = matches[i];
    for (var j = 0; j < match_list.length; j++) {
      for (var k = 0; k < 2; k++) {
        if (match_list[j][k] == playerId) {
          match_list[j][k] = null;
        }
      }
    }
  }
}

function applyModifications(matches, modifications) {
  // For each modification, we need to make the player win all their previous
  // matches, too.
  var winner = -1;
  matches = JSON.parse(JSON.stringify(matches));
  modifications.forEach(mod => {
    var fillToRound = 0;
    if ('winner' in mod) {
      winner = mod.winner;
      fillToRound = matches.length - 1;
    } else {
      fillToRound = mod.toRound;
    }

    for (var i = 0; i < Math.min(fillToRound, matches.length); i++) {
      var match_list = matches[i];
      for (var j = 0; j < match_list.length; j++) {
        var players = match_list[j];
        for (var k = 0; k < 2; k++) {
          if (players[k] == mod.playerId) {
            var nextMatch = matches[i + 1][Math.floor(j / 2)];
            var oldWinner = nextMatch[j % 2];
            nextMatch[j % 2] = mod.playerId;
            if (oldWinner != mod.playerId) {
              clearPlayer(matches, oldWinner, i + 1);
            }
          }
        }
      }
    }
  });

  return [matches, winner];
}

// Apply a set of modifications to matches, returning [newMatches, winner].
function applyModificationsAndFill(matches, modifications) {
  var winner;
  for (var i = 0; i < modifications.length; i++) {
    [matches, winner] = fillBracket(matches, winner);
    [matches, winner] = applyModifications(matches, [modifications[i]]);
  }
  [matches, winner] = fillBracket(matches, winner);
  return [matches, winner];
}

// Number of ranking points you earn for getting to each round.
var ROUND_POINTS = [
  10,
  45,
  90,
  180,
  360,
  720,
  1200,
  2000
];

// Returns a list of new point values for each player
function playerPoints(matches, winner) {
  var points = new Array(128);
  matches.forEach((match_list, round_idx) => {
    match_list.forEach(match => {
      var [p1, p2] = match;
      if (p1 !== null) points[p1] = ROUND_POINTS[round_idx];
      if (p2 !== null) points[p2] = ROUND_POINTS[round_idx];
    });
  });
  if (winner !== null && winner !== undefined) {
    points[winner] = ROUND_POINTS[matches.length];
  }
  return points;
}

// Add "next week" data to the ranking table in light of tourney results.
// This adds points_gaining, new_points and new_rank fields.
function updateRankings(players, matches, winner) {
  var players = JSON.parse(JSON.stringify(players));
  var points = playerPoints(matches, winner);
  players.forEach((p, i) => {
    p.points_gaining = points[i];
    p.new_points = p.points - p.points_dropping + p.points_gaining;
  });

  var point_indices = _.chain(players)
                       .map((p, i) => [p.new_points, i])
                       .sortBy(x => -x[0])
                       .map((x, i) => [x[1], 1 + i])
                       .object()
                       .value();

  players.forEach((p, i) => {
    p.new_rank = point_indices[i];
  });

  return players;
}

// Return the player ID of the winner of a particular match (or null).
function getWinnerId(matches, roundIndex, slot) {
  return matches[roundIndex + 1][Math.floor(slot / 2)][slot % 2];
}

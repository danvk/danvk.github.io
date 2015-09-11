'use strict';

var RankingRow = React.createClass({
  render: function() {
    var player = this.props.player;
    var rank_delta = player.rank - player.new_rank;
    var rank_delta_el = null;
    if (rank_delta > 0) {
      rank_delta_el = <span className="rank-improve">(+{rank_delta})</span>;
    } else if (rank_delta < 0) {
      rank_delta_el = <span className="rank-drop">(–{-rank_delta})</span>;
    }
    var points_delta = player.points_gaining - player.points_dropping;
    return (
      <tr>
        <td className="num">{player.rank}</td>
        <td>{player.name}</td>
        <td className="num">{player.points}</td>
        <td className="num">{player.points_dropping}</td>
        <td className="num">{player.points_gaining}</td>
        <td className="num">{points_delta > 0 ? '+' : ''}{points_delta}</td>
        <td className="num">{player.new_points}</td>
        <td>{player.new_rank} {rank_delta_el}</td>
      </tr>
    );
  }
});

var RankingTable = React.createClass({
  render: function() {
    var players = this.props.players;
    return (
      <table className="rankings">
        <thead>
          <tr>
            <th className="num">Rank</th>
            <th>Player</th>
            <th className="num">Points</th>
            <th className="num">Drop</th>
            <th className="num">Gain</th>
            <th className="num">∆</th>
            <th className="num">New Pts</th>
            <th>New Rank</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => <RankingRow player={p} key={i} />)}
        </tbody>
      </table>
    );
  }
});

var Match = React.createClass({
  propTypes: {
    players: React.PropTypes.array.isRequired,
    winner: React.PropTypes.number,  // player ID
    round: React.PropTypes.number,
    slot: React.PropTypes.number,
    onClick: React.PropTypes.func.isRequired
  },
  click: function(i) {
    this.props.onClick(this.props.round, this.props.slot, i, this.props.players[i].index);
  },
  render: function() {
    var players = this.props.players;
    var playerSpans = players.map((p, i) => <span onClick={() => this.click(i)}>{p ? p.name : '\u00a0'}</span>);
    var winner = this.props.winner;
    if (winner !== null && winner !== undefined) {
      players.forEach((p, i) => {
        if (p && p.index == winner) playerSpans[i] = <b>{playerSpans[i]}</b>;
      });
    }
    return (
      <div className="match">
        {playerSpans[0]}
        <br/>
        {playerSpans[1]}
      </div>
    );
  }
});

var Bracket = React.createClass({
  propTypes: {
    matches: React.PropTypes.array.isRequired,
    players: React.PropTypes.array.isRequired,
    winner: React.PropTypes.number,
    startRound: React.PropTypes.number,
    handleAdvancePlayer: React.PropTypes.func.isRequired
  },
  handleClick: function(round, slot, participant, playerId) {
    this.props.handleAdvancePlayer(playerId, round, slot);
  },
  render: function() {
    var {matches, players} = this.props;
    var startRound = this.props.startRound || 0;
    var rows = matches[0].map((match, idx) => {
      var row_cells = [];
      var factor = 1;
      for (var i = 0; i < matches.length; i++, factor *= 2) {
        if (idx % factor == 0) {
          var match = matches[i][idx / factor];
          var winner = i == matches.length - 1 ? this.props.winner : null;
          row_cells.push(<td className="match-cell" key={i} rowSpan={factor}>
            {i > 0 ? <div className="connector"></div> : null}
            <Match players={match.map(x => players[x])}
                   winner={winner}
                   round={i + startRound}
                   slot={idx/factor}
                   onClick={this.handleClick} />
          </td>);
        }
      }

      return <tr key={idx}>{row_cells}</tr>;
    });

    return (
      <table><tbody>{rows}</tbody></table>
    );
  }
});

var Root = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  getInitialState: function() {
    return this.stateWithModifications([]);
  },
  addModification: function(playerId, fromRound, fromSlot) {
    var originalMatches = this.props.data.matches;
    var modifications = this.state.modifications;
    if (fromRound == originalMatches.length - 1) {
      modifications.push({winner: playerId});
    } else {
      modifications.push({playerId, toRound: 1 + fromRound});
    }
    this.setState(this.stateWithModifications(modifications));
  },
  resetModifications: function() {
    this.setState(this.stateWithModifications([]));
  },
  stateWithModifications: function(modifications) {
    var originalMatches = this.props.data.matches;
    var [newMatches, winner] = applyModificationsAndFill(originalMatches, modifications);
    return {
      modifications,
      matches: newMatches,
      winner
    };
  },
  render: function() {
    var players = this.props.data.players;
    var originalMatches = this.props.data.matches;
    var matches = this.state.matches;
    var winner = this.state.winner;
    players = updateRankings(players, matches, winner);
    return (
      <div>
        <button onClick={this.resetModifications}>Reset</button><br/>
        <Bracket matches={matches.slice(3)}
                 winner={winner}
                 players={players}
                 startRound={3}
                 handleAdvancePlayer={this.addModification} />
        <RankingTable players={players} />
      </div>
    );
  }
});

data.players.forEach((p, i) => { p.index = i; });
React.render(<Root data={data} />, document.getElementById('root'));

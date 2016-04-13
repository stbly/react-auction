import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import ValueList from '../components/ValueList'
import Player from '../components/Player'
import PlayerList from '../components/PlayerList'
import PlayerInput from '../components/PlayerInput'
import FavoritedPlayerList from '../components/FavoritedPlayerList.js'

import * as playerActions from '../redux/modules/players'

import {sortBy} from '../helpers/sortUtils';
import {filterBy, filterByPosition} from '../helpers/filterUtils';
import calculateSGPFor from '../helpers/PlayerSgpUtils'
import * as PlayerListUtils from '../helpers/PlayerListUtils'
import * as SettingsUtils from '../helpers/SettingsUtils'
import assignPlayerValues from '../helpers/PlayerValueUtils'

import classNames from 'classnames';

import '../../stylesheets/components/app.scss'
import '../../stylesheets/components/players.scss'


class Players extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activePlayer: null
		}
	}

	componentWillMount() {
		this.props.actions.receivePlayers()
	}

	updateActivePlayer (player) {
		var playerToUpdate = this.props.players[Number(player)];
		this.setState({activePlayer: playerToUpdate});
	}

	getActivePlayer () {
		if (!this.state.activePlayer) {
			return;
		}

		var el;
		var type = this.state.activePlayer.type;
		var activePlayerClasses = classNames('active-player',type);
		var tableClasses = classNames('player-list',type);
		if (this.state.activePlayer) {
			var categories = type === 'batter' ? this.props.battingCategories : this.props.pitchingCategories;
			el = <div className={activePlayerClasses}>
					<table className={tableClasses}>
						<tbody>
							<Player
								hideMetaInfo={true}
								player={this.state.activePlayer}
								categories={categories}/>
						</tbody>
					</table>
				</div>
		}

		return el;
	}

	render() {
		return (

			<div className='players-route'>
				<div className='favorited-players'>
					<FavoritedPlayerList
						type='batter'
						players={PlayerListUtils.getFavoritedPlayers(this.props.rankedBatters, 'batter')}
						playerSelected={this.updateActivePlayer.bind(this)}
						categories={this.props.battingCategories}
						updateFavorited={this.props.actions.updatePlayerFavorited} />

					<FavoritedPlayerList
						type='pitcher'
						players={PlayerListUtils.getFavoritedPlayers(this.props.rankedPitchers, 'batter')}
						playerSelected={this.updateActivePlayer.bind(this)}
						categories={this.props.pitchingCategories}
						updateFavorited={this.props.actions.updatePlayerFavorited} />
					<div className='clear-both'></div>
				</div>

				<div className='combined-rankings'>
					<PlayerInput
						searchablePlayers={PlayerListUtils.getUnusedPlayers(this.props.players)}
						searchableTeams={this.props.teams}
						playerEntered={this.props.actions.assignPlayer} />

					{this.getActivePlayer()}

					<ValueList type='batter'
						players={this.props.rankedBatters}
						categories={this.props.battingCategories}
						playerSelected={this.updateActivePlayer.bind(this)}
						updateStat={this.props.actions.updatePlayerStat}
						updateCost={this.props.actions.updatePlayerCost}
						updateFavorited={this.props.actions.updatePlayerFavorited} />

					<ValueList type='pitcher'
						players={this.props.rankedPitchers}
						categories={this.props.pitchingCategories}
						playerSelected={this.updateActivePlayer.bind(this)}
						updateStat={this.props.actions.updatePlayerStat}
						updateCost={this.props.actions.updatePlayerCost}
						updateFavorited={this.props.actions.updatePlayerFavorited} />

					<div className='clear-both'></div>
				</div>

				<div className='clear-both'></div>
			</div>
		)
	}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(playerActions, dispatch)
    }
}

function mapStateToProps (state,ownProps) {
	var players = state.players.data,
		settings = state.settings.data,
		categories = state.categories.data,
		positions = state.positions.data,
		teams = state.teams.data;

	if (!(players.length > 0)) {
		return {}
	}

	var batters = filterBy(players, 'type', 'batter');
	var pitchers = filterBy(players, 'type', 'pitcher');

	var battingCategories = SettingsUtils.getCategories(categories.batter);
	var pitchingCategories = SettingsUtils.getCategories(categories.pitcher);

	var battingSpots = settings.numBatters;
	var pitchingSpots = settings.rosterSpots - settings.numBatters;

	var battersWithSGP = calculateSGPFor(batters, battingCategories, battingSpots, 'batter');
	var pitchersWithSGP = calculateSGPFor(pitchers, pitchingCategories, pitchingSpots, 'pitcher');

	var numBattersToDraft = settings.numBatters * settings.numTeams;
	var numPitchersToDraft = (settings.rosterSpots - settings.numBatters) * settings.numTeams;

	var batterConditions = SettingsUtils.getScarcePositions(positions.batter);
	var pitcherConditions = SettingsUtils.getScarcePositions(positions.pitcher);

	var [draftableBatters, unusedBatters] = PlayerListUtils.getPlayerList(battersWithSGP, numBattersToDraft, batterConditions);
	var [draftablePitchers, unusedPitchers] = PlayerListUtils.getPlayerList(pitchersWithSGP, numPitchersToDraft, pitcherConditions);

	var totalSalary = settings.teamSalary * settings.numTeams;

	var battingDollarsToSpend = totalSalary * (settings.battingPercentage / 100);
	var pitchingDollarsToSpend = totalSalary * ((100 - settings.battingPercentage) / 100);

	var valuedBatters = assignPlayerValues(draftableBatters, numBattersToDraft, batters, battingDollarsToSpend, batterConditions);
	var valuedPitchers = assignPlayerValues(draftablePitchers, numPitchersToDraft, pitchers, pitchingDollarsToSpend, pitcherConditions);

	return {
		players,
		rankedBatters: valuedBatters,
		rankedPitchers: valuedPitchers,
		battingCategories,
		pitchingCategories,
		teams: SettingsUtils.getTeamNames(teams)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Players);

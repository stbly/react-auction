import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as playerActions from '../redux/modules/players'

import classNames from 'classnames';

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as PlayerListUtils from '../helpers/PlayerListUtils'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import PlayerList from '../components/PlayerList.js'
import PlayerInput from '../components/PlayerInput'

import '../../stylesheets/components/player-list.scss'

class PlayerListsContainer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listTypeShown: 'batter'
		}
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}

	getLists () {
		if (!this.props.lists){
			return <div> </div>
		}

		var listToShow = this.state.listTypeShown;

		return this.props.lists.map ( (list, index) => {
			var {categories, players, type } = list;

			var playerList;
			if (type === listToShow) {
				playerList = <PlayerList
							key={index}
							type={type}
							players={players}
							categories={categories}
							sortPlayers={this.props.actions.sortPlayers}
							playerSelected={this.props.actions.updateActivePlayer}
							hideValueInfo={false}
							updateStat={this.props.actions.updatePlayerStat}
							updateCost={this.props.actions.updatePlayerCost}
							updateFavorited={this.props.actions.updatePlayerFavorited} />
			}
			return playerList
		})

	}

	shouldComponentUpdate (nextProps, nextState) {
		console.log('trying to update PlayerLists')
		var stringifiedNextProps = JSON.stringify(nextProps)
		var stringifiedProps = JSON.stringify(this.props)
		return (stringifiedNextProps != stringifiedProps)
	}

	componentDidUpdate () {
		console.log ('player lists updated');
	}

	render () {
		return (
			<div>
				<PlayerInput
					searchablePlayers={PlayerListUtils.getUnusedPlayers(this.props.players)}
					searchableTeams={this.props.teams}
					playerEntered={this.props.actions.assignPlayer} />

				{this.getLists()}
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

	if (!state.players.data || !state.categories.data || !state.teams.data) {
		return {}
	}

	var players = state.players.data,
		{rankedBatters, rankedPitchers} = state.players.playerLists,
		categories = state.categories.data,
		teams = SettingsUtils.getTeamNames( state.teams.data );

	var battingCategories = SettingsUtils.getCategories(categories.batter);
	var pitchingCategories = SettingsUtils.getCategories(categories.pitcher);

	var lists = [{
			type: 'batter',
			players: rankedBatters,
			categories: battingCategories
		},
		{
			type: 'pitcher',
			players: rankedPitchers,
			categories: pitchingCategories

		}]

	return {
		players,
		teams,
		lists
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerListsContainer);

import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'

import { playerIsUndrafted } from '../helpers/PlayerListUtils'
import { sortByProperty } from '../helpers/arrayUtils';

import ActivePlayer from './ActivePlayer'
import PlayerInput from '../components/PlayerInput'
import PlayerListsContainer from './PlayerListsContainer'
import classNames from 'classnames';

import '../../stylesheets/components/players.scss'

class Players extends Component {

	constructor(props) {
		super(props)
		this.state = {
			hideDraftedPlayers: false,
			showPlayersBelowReplacement: false
		}
	}

	createPlayerArrayFromIds (idsArray) {
		const { players } = this.props
		const playerArray = idsArray.map( id => players[id] )
		return playerArray
	}

	getSearchablePlayers () {
		const { players } = this.props
		const { hideDraftedPlayers } = this.state
		const playerIds = Object.keys(players)

		const useablePlayers = playerIds.filter( id => {
			const draftable = players[id].value
			const drafted = hideDraftedPlayers ? players[id].owner : false
			return draftable && !drafted
		})

		return this.createPlayerArrayFromIds( useablePlayers );
	}

	getPlayersToDisplay () {
		const { players, positionData, numTeams } = this.props
		const { showPlayersBelowReplacement } = this.state
		const playerArray = Object.keys(players).map( id => players[id])

		const useablePlayers = []
		Object.keys(positionData).forEach( type => {
			const limit = positionData[type].rosterSpots * numTeams
			console.log(type, limit - 1)
			const playersOfType = playerArray.filter( player => player.type === type )
			const playersInOrder = playersOfType.sort( (a,b) => sortByProperty(a,b,'rank') )
			const group = showPlayersBelowReplacement ? playersInOrder : playersInOrder.splice(0, limit)
			useablePlayers.push( ...group )
		})

		return useablePlayers;
	}

	toggleHideDraftedPlayers () {
		this.setState({hideDraftedPlayers: !this.state.hideDraftedPlayers})
	}


	render() {
		const { hideDraftedPlayers } = this.state
		const { teams, positionData, playerActions } = this.props
		return (

			<div className='players-route page'>

				<section className='drafting-tools'>
					<div className='player-lists-header'>
						{ this.renderActivePlayer() }
						<PlayerInput
							searchablePlayers={this.getSearchablePlayers()}
							searchableTeams={teams}
							playerEntered={playerActions.assignPlayer} />
					</div>
					<div className='hide-selected-container'>
						<input className='hide-selected-toggle'
							type="checkbox"
							checked={hideDraftedPlayers}
							onChange={this.toggleHideDraftedPlayers.bind(this)} />

						<span className='hide-selected-text'>Hide Drafted Players</span>
					</div>
				</section>

				<div className='combined-rankings'>
					<PlayerListsContainer
						players={ this.getPlayersToDisplay() }
						positionData={positionData}
						teams={teams}
						actions={playerActions} />

					<div className='clear-both'></div>
				</div>

				<div className='clear-both'></div>
			</div>
		)
	}

	renderActivePlayer () {
		const { activePlayer, positionData, playerActions } = this.props
		const { updatePlayerStat, updatePlayerNotes, updatePlayerFavorited } = playerActions
		if (!activePlayer) return

		return (
			<ActivePlayer
				player = {activePlayer}
				positionData = {positionData}
				updateStat = {updatePlayerStat}
				updateNotes = {updatePlayerNotes}
				updateFavorited = {updatePlayerFavorited}
			/>
		)
	}
}


function mapDispatchToProps(dispatch) {
	return {
		playerActions: bindActionCreators(playerActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	var players = state.players.data,
		teams = state.teams.data ? SettingsUtils.getTeamNames( state.teams.data ) : null,
		{ numTeams, positionData } = state.settings.data,
		activePlayer = players[state.players.activePlayerId]

	return {
		players,
		teams,
		numTeams,
		positionData,
		activePlayer: activePlayer,
		isLoading: state.players.isLoading
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)
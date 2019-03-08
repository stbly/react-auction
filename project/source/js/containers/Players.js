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
import PlayerList from '../components/PlayerList'
import classNames from 'classnames';

class Players extends Component {

	constructor(props) {
		super(props)
		this.state = {
			hideDraftedPlayers: false,
			// showRatios: false,
			showPlayersBelowReplacement: false,
			preserveRatios: true
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
			const drafted = hideDraftedPlayers ? players[id].isDrafted : false
			return draftable && !drafted
		})

		return this.createPlayerArrayFromIds( useablePlayers );
	}

	getPlayersToDisplay () {
		const { players, positionData, numTeams } = this.props
		const { showPlayersBelowReplacement, hideDraftedPlayers } = this.state
		const playerArray = Object.keys(players).map( id => players[id])

		let useablePlayers = []
		Object.keys(positionData).forEach( type => {
			const limit = positionData[type].rosterSpots * numTeams
			const playersOfType = playerArray.filter( player => player.type === type )
			const playersInOrder = playersOfType.sort( (a,b) => sortByProperty(a,b,'rank') )
			const group = showPlayersBelowReplacement ? playersInOrder : playersInOrder.splice(0, limit)
			useablePlayers.push( ...group )
		})

		if (hideDraftedPlayers) {
			useablePlayers = useablePlayers.filter( player => !player.isDrafted )
		}

		return useablePlayers.sort( (a,b) => sortByProperty(a,b,'rank') );
	}

	toggleState(property) {
		this.setState({
			[property]: !this.state[property]
		})
	}

	render() {
		const { hideDraftedPlayers, showPlayersBelowReplacement, preserveRatios } = this.state
		const { teams, isAuctionLeague, positionData, playerActions } = this.props
		const toggleState = this.toggleState.bind(this)
		return (
			<div className='players-route page'>

				<section className='drafting-tools'>
					<div className='player-lists-header'>
						{ this.renderActivePlayer() }
						<PlayerInput
							searchablePlayers={this.getSearchablePlayers()}
							searchableTeams={teams}
							playerEntered={playerActions.draftPlayer} />
					</div>
					<div className='hide-selected-container'>
						<input className='hide-selected-toggle'
							type="checkbox"
							checked={hideDraftedPlayers}
							onChange={() => toggleState('hideDraftedPlayers')} />
						<span className='hide-selected-text'>Hide Drafted Players</span>
					</div>
					<div className='show-replacement-container'>
						<input className='show-replacement-toggle'
							type="checkbox"
							checked={showPlayersBelowReplacement}
							onChange={() => toggleState('showPlayersBelowReplacement')} />
						<span className='hide-selected-text'>Show Replacement Players</span>
					</div>
					{/*<div className='show-ratios-container'>
						<input className='show-ratios-toggle'
							type="checkbox"
							checked={showRatios}
							onChange={() => toggleState('showRatios')} />
						<span className='hide-selected-text'>Show Stat Ratios</span>
					</div>*/}
					<div className='preserve-ratios-container'>
						<input className='preserve-ratios-toggle'
							type="checkbox"
							checked={preserveRatios}
							onChange={() => toggleState('preserveRatios')} />
						<span className='hide-selected-text'>Preserve Stat Ratios</span>
					</div>
				</section>

				<div className='combined-rankings'>
					<PlayerList
						players={ this.getPlayersToDisplay() }
						isAuctionLeague={isAuctionLeague}
						preserveRatios={preserveRatios}
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
		{ numTeams, positionData, isAuctionLeague } = state.settings.data,
		activePlayer = players[state.players.activePlayerId]

	return {
		players,
		teams,
		numTeams,
		positionData,
		isAuctionLeague,
		activePlayer: activePlayer,
		isLoading: state.players.isLoading
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)

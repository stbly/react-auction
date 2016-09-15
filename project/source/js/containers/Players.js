import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'

import { playerIsUndrafted } from '../helpers/PlayerListUtils'

import ActivePlayer from './ActivePlayer'
import PlayerInput from '../components/PlayerInput'
import PlayerListsContainer from './PlayerListsContainer'
import classNames from 'classnames';

import '../../stylesheets/components/players.scss'

class Players extends Component {

	constructor(props) {
		super(props)
		this.state = {
			hideDraftedPlayers: false
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
			const drafted = hideDraftedPlayers ? players[id].cost : false
			return draftable && !drafted
		})

		return this.createPlayerArrayFromIds( useablePlayers );
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
						<ActivePlayer />
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
						players={ this.getSearchablePlayers() }
						positionData={positionData}
						teams={teams}
						actions={playerActions} />

					<div className='clear-both'></div>
				</div>

				<div className='clear-both'></div>
			</div>
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
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positionData = state.settings.data.positionData

	return {
		players,
		positionData,
		teams,
		isLoading: state.players.isLoading
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)
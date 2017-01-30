import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import { generateLeagueId } from '../helpers/LeagueUtils'
import * as playerActions from '../redux/modules/players'
import * as teamActions from '../redux/modules/teams'

import Team from '../components/Team'
import TeamPlanner from '../components/TeamPlanner'
import PlayerInput from '../components/PlayerInput'

import classNames from 'classnames';

class Teams extends Component {
	constructor(props) {
		super(props);
	}

	createNewTeam () {
	}

	getUndraftedPlayers () {
		const { players } = this.props
		const playerIds = Object.keys(players)

		const useablePlayers = playerIds.filter( id => {
			// const draftable = players[id].value
			const drafted = players[id].owner
			return /*draftable &&*/ !drafted
		})

		return useablePlayers.map( id => players[id]);
	}

	makeTeamActive(id) {
		const { changeActiveTeam } = this.props.teamActions
		changeActiveTeam( id )
	}

	addPlayer (playerId, playerCost) {
		const { draftPlayer } = this.props.playerActions
		const { activeTeam } = this.props
		draftPlayer(playerId, playerCost, activeTeam)
	}
	
	removeAllPlayers (teamId) {
		const players = this.props.teams[teamId].players;
		if (!players) return;

		const { undraftPlayer } = this.props.playerActions

		players.forEach( playerId => {
			undraftPlayer(playerId, teamId)
		})
	}

	render() {
		const { uid } = this.props.user

		return (
			<div className='leagues-route page'>
				{ uid ? this.renderTeams() : this.renderLoginMessage() }
			</div>
		)
	}

	renderTeams () {
		const { teamActions, leagues, teams, activeTeam } = this.props

		return (			
			<div>
				<section className='section-with-sidebar'>
					<div className='sidebar'>
						<button onClick={ this.createNewTeam.bind(this) } className='button'> Add Team + </button>
					</div>
					<div className='main'>
						<div className='team-tabs'>
							{ this.renderTeamTabs() }
						</div>
						<PlayerInput
							searchablePlayers={this.getUndraftedPlayers()}
							searchableTeams={teams}
							playerEntered={this.addPlayer.bind(this)} />

						<div className='team-info'>
							{ teams && activeTeam && this.renderTeam( activeTeam ) }
						</div>
					</div>
				</section>
				
				<div className='clear-both'></div>
			</div>
		)
	}

	renderTeamTabs () {
		const { leagues, teams, activeTeam } = this.props
		if (!teams) return

		return Object.keys(teams).map( (key, id) => {
			var isActive = activeTeam === key;
			return (
				<div
					key={key} 
					onClick={this.makeTeamActive.bind(this,key)}
					className={classNames('team-tab', {'active': isActive})}>
						{teams[key].name}
				</div>
			)
		})
	}

	renderTeam (id) {
		const { changeTeamName, removeAllPlayers } = this.props.teamActions
		const { undraftPlayer } = this.props.playerActions
		const { settings } = this.props
		const playerData = this.props.players
		const { positionData, teamSalary } = settings
		const team = this.props.teams[id]
		const { players, name, budgetData } = team
		
		const teamPlayers = players ? this.getPlayersFromIds( players ) : null

		const draftablePlayers = Object.keys(playerData)
			.filter(id => playerData[id].value >= 1)
			.map( id => playerData[id] )

		const undraftPlayerFromTeam = (playerId) => {
			undraftPlayer(playerId, id)
		} 

		return <TeamPlanner
			name={name} 
			teamPlayers={teamPlayers}
			draftablePlayers={draftablePlayers}
			budgetData={budgetData}
			positionData={positionData}
			teamSalary={teamSalary}
			onChangeTeamName={changeTeamName.bind(this, id)}
			onResetPlayers={this.removeAllPlayers.bind(this, id)}
			undraftPlayer={undraftPlayerFromTeam}/>
	}

	getPlayersFromIds (ids) {
		const { players } = this.props
		// return [players[1], players[2]]
		return ids.map( id => {
			const idNumber = Number(id)
			const player = players[ idNumber ]
			return player
		});
	}

	renderLoginMessage () {
		return <div>You are not logged in. Please log in to create a new league.</div>
	}
}


function mapDispatchToProps(dispatch) {
	return {
		teamActions: bindActionCreators(teamActions, dispatch),
		playerActions: bindActionCreators(playerActions, dispatch),
	}
}

function mapStateToProps (state,ownProps) {
	const { teams, user, leagues, players, settings } = state
	const { activeLeague } = leagues
	
	return {
		activeLeague,
		user,
		settings: settings.data,
		players: players.data,
		teams: teams.data,
		activeTeam: teams.activeTeam
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Teams)
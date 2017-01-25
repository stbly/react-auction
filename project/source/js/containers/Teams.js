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
import ValueSubValueDisplay from '../components/ValueSubValueDisplay'

import classNames from 'classnames';

class Teams extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTeam: null
		}
	}

	componentWillReceiveProps(nextProps) {
		if (!this.state.activeTeam && nextProps.teams) {

			var teamNames = Object.keys(nextProps.teams);
			this.setState({
				activeTeam: teamNames[0]
			})
		}
	}

	createNewTeam () {
	}

	getSearchablePlayers () {
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
		this.setState({
			activeTeam: id
		})
	}

	addPlayer (playerId, playerCost) {
		const { draftPlayer } = this.props.playerActions
		const { activeTeam } = this.state
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
		const { teamActions, leagues, teams } = this.props

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
							searchablePlayers={this.getSearchablePlayers()}
							searchableTeams={teams}
							playerEntered={this.addPlayer.bind(this)} />

						<div class='team-info'>
							{ teams && this.state.activeTeam && this.renderBudgetInfo( this.state.activeTeam ) }
							{ teams && this.state.activeTeam && this.renderRoster( this.state.activeTeam ) }
						</div>
					</div>
				</section>
				
				<div className='clear-both'></div>
			</div>
		)
	}

	renderTeamTabs () {
		const { leagues, teams } = this.props
		if (!teams) return

		return Object.keys(teams).map( (key, id) => {
			var isActive = this.state.activeTeam === key;
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

	renderBudgetInfo (id) {
		// const { changeTeamName, removeAllPlayers } = this.props.teamActions
		// const { undraftPlayer } = this.props.playerActions
		// const { settings } = this.props
		// const { positionData, teamSalary } = settings
		// const team = this.props.teams[id]
		// const { players, name } = team
		
		// const teamPlayers = players ? this.getPlayersFromIds( players ) : null

		// const undraftPlayerFromTeam = (playerId) => {
		// 	undraftPlayer(playerId, id)
		// } 

		return <ValueSubValueDisplay 
			value={270} 
			heading='Remaining Budget' 
			subValue='52'
			subValueHeading='Max Bid'
			valueIsDollarAmount={true} 
			subValueIsDollarAmount={true} />
	}

	renderRoster (id) {
		const { changeTeamName, removeAllPlayers } = this.props.teamActions
		const { undraftPlayer } = this.props.playerActions
		const { settings } = this.props
		const { positionData, teamSalary } = settings
		const team = this.props.teams[id]
		const { players, name } = team
		
		const teamPlayers = players ? this.getPlayersFromIds( players ) : null

		const undraftPlayerFromTeam = (playerId) => {
			undraftPlayer(playerId, id)
		} 

		return <TeamPlanner
			name={name} 
			players={teamPlayers}
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
		teams: teams.data
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Teams)
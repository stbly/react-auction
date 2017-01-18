import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import { generateLeagueId } from '../helpers/LeagueUtils'
import * as settingsActions from '../redux/modules/settings'
import * as leagueActions from '../redux/modules/leagues'

import LeagueSettings from '../components/LeagueSettings'

import { 
	mergeDeep,
	endpointToObject } from '../helpers/dataUtils'

import { settingsEndpoints } from '../helpers/constants/settings'

import classNames from 'classnames';

class Settings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			leagueName: 'New League',
			localSettings: this.props.settings
		}
	}

	createNewLeague () {
		const { changeActiveLeague } = this.props.leagueActions
		const newLeagueId = generateLeagueId()
		
		changeActiveLeague(newLeagueId)
	}

	getLeagueSavedState () {
		const { leagues, activeLeague } = this.props
		
		const isSaved = activeLeague ? Object.keys(leagues).indexOf(activeLeague.id) > -1 : false
		return {
			leagueIsSaved: isSaved,
			leagueIsNotSaved: !isSaved
		}
	}

	saveLeague () {
		const { leagueActions, activeLeague } = this.props
		const { saveLeague } = leagueActions
		const { leagueName, localSettings } = this.state

		saveLeague( activeLeague.id, leagueName, localSettings )
	}

	leagueNameWasChanged (name) {
		const { leagueIsSaved } = this.getLeagueSavedState()

		if (leagueIsSaved) {
			const { changeActiveLeagueName } = this.props.leagueActions
			if (changeActiveLeagueName) changeActiveLeagueName(name)
		} else {
			this.setState({
				leagueName: name
			})
		}
	}

	settingWasChanged (setting, value) {
		const { leagueIsSaved } = this.getLeagueSavedState()

		if (leagueIsSaved) {
			const { changeSetting } = this.props.settingsActions
			if (changeSetting) changeSetting(setting, value)
		} else {
			const newSetting = endpointToObject(settingsEndpoints[setting], value)
			this.setState({
				localSettings: mergeDeep(this.state.localSettings, newSetting)
			})
		}
	}

	render() {
		const { uid } = this.props.user

		return (
			<div className='leagues-route page'>
				{ uid ? this.renderLeagueSelect() : this.renderLoginMessage() }
			</div>
		)
	}

	renderLeagueSelect () {
		const { activeLeague, leagueActions } = this.props
		const { leagueIsSaved } = this.getLeagueSavedState()

		return (			
			<div>
				<section className='section-with-sidebar'>
					<div className='sidebar'>

						<button onClick={ this.createNewLeague.bind(this) } className='button'> Add league + </button>
						<ul> { this.renderLeagueSelectButtons() } </ul>

					</div>
					<div className='main'>
						{ activeLeague ? this.renderLeagueSettings() : this.renderCreateLeagueMessage() }
						{ leagueIsSaved ? null : this.renderSaveButton() }
					</div>
				</section>
				
				<div className='clear-both'></div>
			</div>
		)
	}

	renderLeagueSelectButtons () {
		const { leagues ,activeLeague, leagueActions } = this.props
		if (!leagues) return

		return Object.keys(leagues).map( leagueId => {
			const league = leagues[leagueId]
			const isActiveLeague = activeLeague ? activeLeague.id.toString() === leagueId.toString() : false
			const leagueClasses = classNames({active: isActiveLeague})
			const { changeActiveLeague } = leagueActions

			return (
				<li key={leagueId}>
					<button 
						className={leagueClasses} 
						onClick={changeActiveLeague.bind(this, leagueId)} > 
							{league} 
					</button>
				</li>
			)
		})
	}

	renderLeagueSettings () {
		const { settings, settingsActions, leagues, leagueActions, activeLeague } = this.props
		const { changeActiveLeagueName } = leagueActions
		const { leagueIsSaved } = this.getLeagueSavedState()

		return <LeagueSettings 
			name={ leagueIsSaved ? activeLeague.name : this.state.leagueName } 
			settings={ leagueIsSaved ? settings : this.state.localSettings }
			changeLeagueName={this.leagueNameWasChanged.bind(this)}
			changeSetting={this.settingWasChanged.bind(this)} />
	}

	renderCreateLeagueMessage () {
		return <div>You don't have any saved leagues.</div>
	}

	renderLoginMessage () {
		return <div>You are't logged in. Please log in to create a new league.</div>
	}

	renderSaveButton () {
		return <button onClick={ this.saveLeague.bind(this) } className='save-league-button'>Save League</button>
	}
}


function mapDispatchToProps(dispatch) {
	return {
		settingsActions: bindActionCreators(settingsActions, dispatch),
		leagueActions: bindActionCreators(leagueActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	const { user, settings, leagues } = state
	const { activeLeague } = leagues

	return {
		user,
		activeLeague,
		leagues: leagues.data,
		settings: settings.data
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
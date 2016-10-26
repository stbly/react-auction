import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as settingsActions from '../redux/modules/settings'
import * as leagueActions from '../redux/modules/leagues'
import * as playerActions from '../redux/modules/players'
import * as userActions from '../redux/modules/user'

import IconButton from '../components/IconButton'
import LeagueSettings from '../components/LeagueSettings'

import classNames from 'classnames';

class Settings extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { uid } = this.props.user

		return (
			<div className='leagues-route page'>
				{ uid ? this.renderLeagueSelect() : this.renderLoginMessage() }
			</div>
		)
	}

	renderLoginMessage () {
		return (
			<div>
				You are not logged in. Please log in to select a saved league.
			</div>
		)
	}

	renderLeagueSelect () {
		const { activeLeague } = this.props

		return (			
			<div>
				<section className='section-with-sidebar'>
					<div className='sidebar'>

						<button className='button'> Add league + </button>
						{ this.renderLeagueSelectButtons() }

					</div>
					<div className='main'>
						{ activeLeague ? this.renderLeagueSettings() : this.renderCreateLeagueMessage}
					</div>
				</section>
				
				<div className='clear-both'></div>
			</div>
		)				
	}

	renderLeagueSelectButtons () {
		const { leagues } = this.props
		if (!leagues) return
		return leagues.map( league => {
			return <button>league.id</button>
		})
	}

	renderLeagueSettings () {
		const { settings, settingsActions, leagueActions, activeLeague } = this.props
		const { changeSetting } = settingsActions
		const { changeActiveLeagueName } = leagueActions

		
		return <LeagueSettings 
			name={activeLeague.name} 
			settings={settings} 
			changeLeagueName={changeActiveLeagueName}
			changeSetting={changeSetting} />
	}

	renderCreateLeagueMessage () {
		return <div>Select a league, or create a new one.</div>
	}
}


function mapDispatchToProps(dispatch) {
	return {
		settingsActions: bindActionCreators(settingsActions, dispatch),
		leagueActions: bindActionCreators(leagueActions, dispatch),
		playerActions: bindActionCreators(playerActions, dispatch),
		userActions: bindActionCreators(userActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	const { user, settings, leagues } = state
	const { activeLeague } = leagues
	
	return {
		user,
		activeLeague,
		settings: settings.data
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'
import * as userActions from '../redux/modules/user'

import IconButton from '../components/IconButton'
import LeagueSettings from '../components/LeagueSettings'

import classNames from 'classnames';


class Leagues extends Component {
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
		const { currentLeague } = this.props

		return (			
			<div>
				<section className='section-with-sidebar'>
					<div className='sidebar'>

						<button className='button'> Add league + </button>
						{ this.renderLeagueSelectButtons() }

					</div>
					<div className='main'>
						{ currentLeague ? this.renderLeagueSettings() : this.renderCreateLeagueMessage}
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
		console.log('render this')
		return <LeagueSettings />
	}

	renderCreateLeagueMessage () {
		console.log('render this')
		return <div>Select a league, or create a new one.</div>
	}
}


function mapDispatchToProps(dispatch) {
	return {
		playerActions: bindActionCreators(playerActions, dispatch),
		userActions: bindActionCreators(userActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	const { user } = state
/*
	if (!state.categories.data || !state.teams.data) {
		return {}
	}
*/
	return {
		user,
		currentLeague: true
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Leagues)
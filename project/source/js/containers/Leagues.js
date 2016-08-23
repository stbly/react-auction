import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'
import * as userActions from '../redux/modules/user'

import classNames from 'classnames';


class Leagues extends Component {
	constructor(props) {
		super(props);
	}

	render() {

		return (

			<div className='leagues-route page'>

				<section className='section-with-sidebar'>
					<div className='sidebar'>
						<button>League One</button>
					</div>
					<div className='main'>
					</div>
				</section>

				<div className='clear-both'></div>
			</div>
		)
	}
}


function mapDispatchToProps(dispatch) {
	return {
		playerActions: bindActionCreators(playerActions, dispatch),
		userActions: bindActionCreators(userActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {

	if (!state.categories.data || !state.teams.data) {
		return {}
	}

	var categories = state.categories.data,
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positions = state.positions.data,
		settings = state.settings.data,
		user = state.user

	return {
		user,
		teams,
		categories,
		positions,
		settings
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Leagues)
import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'
import * as userActions from '../redux/modules/user'

import ValueList from '../components/ValueList'
import ActivePlayer from './ActivePlayer'
import PlayerListsContainer from './PlayerListsContainer'
import FavoritePlayerListsContainer from './FavoritePlayerListsContainer'

import classNames from 'classnames';

import '../../stylesheets/components/app.scss'
import '../../stylesheets/components/players.scss'

class Players extends Component {
	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(nextProps) {
		console.log('componentWillReceiveProps')
		// this.props.playerActions.fetchPlayers()
	}

	render() {

		var loginStuff
		if (this.props.user && this.props.user.uid) {
			loginStuff = <div>
				<button onClick={this.props.userActions.attemptLogout}>Log Out</button>
				<span>{this.props.user.username}</span>
			</div>
		} else {
			loginStuff = <div>
				<button onClick={this.props.userActions.attemptLogin}>Log In</button>
			</div>
		}

		return (

			<div className='players-route page'>


				{loginStuff}

				<div className='combined-rankings'>
					<PlayerListsContainer
						shouldRender={this.props.rerender}
						players={ Object.toArray(this.props.players) }
						categories={this.props.categories}
						teams={this.props.teams}
						positions={this.props.positions}
						actions={this.props.playerActions} />

					<div className='clear-both'></div>
				</div>

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

	if (!state.players.data || !state.categories.data || !state.teams.data) {
		return {}
	}

	var players = state.players.data,
		categories = state.categories.data,
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positions = state.positions.data,
		settings = state.settings.data,
		user = state.user

	var newPlayers = (this === undefined) ? null : !(this.oldPlayers === players)
	if (this) {
		this.oldPlayers = players
	}

	return {
		user,
		rerender: newPlayers,
		players,
		teams,
		categories,
		positions,
		isLoading: state.players.isLoading
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)
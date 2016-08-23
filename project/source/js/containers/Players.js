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

import '../../stylesheets/components/players.scss'

class Players extends Component {
	constructor(props) {
		super(props);
	}

	render() {

		return (

			<div className='players-route page'>

				<div className='combined-rankings'>
					<PlayerListsContainer
						shouldRender={this.props.rerender}
						players={ Object.toArray(this.props.players) }
						positionData={this.props.positionData}
						teams={this.props.teams}
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

	if (!state.players.data || !state.teams.data) {
		return {}
	}

	var players = state.players.data,
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positionData = state.settings.data.positionData,
		user = state.user

	var newPlayers = (this === undefined) ? null : !(this.oldPlayers === players)
	if (this) {
		this.oldPlayers = players
	}

	return {
		user,
		rerender: newPlayers,
		players,
		positionData,
		teams,
		isLoading: state.players.isLoading
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)
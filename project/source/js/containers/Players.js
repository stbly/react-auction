import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'

import ValueList from '../components/ValueList'
import ActivePlayer from './ActivePlayer'
import PlayerListsContainer from './PlayerListsContainer'
import FavoritePlayerListsContainer from './FavoritePlayerListsContainer'
import classNames from 'classnames';

import '../../stylesheets/components/players.scss'

const Players = React.createClass({
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
})


function mapDispatchToProps(dispatch) {
	return {
		playerActions: bindActionCreators(playerActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	var players = state.players.data,
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positionData = state.settings.data.positionData

	var newPlayers = (this === undefined) ? null : !(this.oldPlayers === players)
	if (this) {
		this.oldPlayers = players
	}

	return {
		rerender: newPlayers,
		players,
		positionData,
		teams,
		isLoading: state.players.isLoading
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Players)
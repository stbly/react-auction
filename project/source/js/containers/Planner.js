import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import ValueList from '../components/ValueList'
import ActivePlayer from './ActivePlayer'
import PlayerListsContainer from './PlayerListsContainer'
import FavoritePlayerListsContainer from './FavoritePlayerListsContainer'

import classNames from 'classnames';

class Planner extends Component {
	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}

	render() {
		console.log( 'rendering' )
		return (

			<div className='planner-route'>

			</div>
		)
	}
}

function mapStateToProps (state,ownProps) {

	if (!state.players.data || !state.categories.data || !state.teams.data) {
		return {}
	}

	var players = state.players.data,
		{rankedBatters, rankedPitchers} = state.players.playerLists,
		categories = state.categories.data,
		teams = SettingsUtils.getTeamNames( state.teams.data );

	var battingCategories = SettingsUtils.getCategories(categories.batter);
	var pitchingCategories = SettingsUtils.getCategories(categories.pitcher);

	var lists = [{
			type: 'batter',
			players: rankedBatters,
			categories: battingCategories
		},
		{
			type: 'pitcher',
			players: rankedPitchers,
			categories: pitchingCategories

		}]

	return {
		players,
		teams,
		lists
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps)(Planner);
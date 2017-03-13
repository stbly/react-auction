import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import ActivePlayer from './ActivePlayer'
import PlayerList from '../components/PlayerList'
// import FavoritePlayerList from './FavoritePlayerList'

import classNames from 'classnames';


// import '../../stylesheets/components/players.scss'

class Planner extends Component {
	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}

	render() {

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
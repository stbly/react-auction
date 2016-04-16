import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as playerActions from '../redux/modules/players'

import classNames from 'classnames';

import * as SettingsUtils from '../helpers/SettingsUtils'
import * as PlayerListUtils from '../helpers/PlayerListUtils'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import FavoritePlayerList from '../components/FavoritePlayerList.js'

import PlayerInput from '../components/PlayerInput'

import '../../stylesheets/components/player-list.scss'

class FavoritePlayerListsContainer extends Component {
	constructor(props) {
		super(props)
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}

	shouldComponentUpdate (nextProps, nextState) {
		console.log('trying to update FavoritePlayerLists')
		var stringifiedNextProps = JSON.stringify(nextProps)
		var stringifiedProps = JSON.stringify(this.props)
		return (stringifiedNextProps != stringifiedProps)
	}

	getLists () {
		if (!this.props.lists){
			return <div> </div>
		}
		return this.props.lists.map ( (list, index) => {
			var {categories, players, type } = list;
			return (
					<FavoritePlayerList
						key={index}
						type={type}
						players={players}
						playerSelected={this.props.actions.updateActivePlayer}
						updateFavorited={this.props.actions.updatePlayerFavorited} />
			)
		})
	}

	render () {
		return (
			<div className='favorited-players'>
				{this.getLists()}
			</div>
		)
	}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(playerActions, dispatch)
    }
}

function mapStateToProps (state,ownProps) {

	if (!state.players.data || !state.categories.data) {
		return {}
	}
	var players = state.players.data,
		{rankedBatters, rankedPitchers} = state.players.playerLists;

	var lists = [{
			type: 'batter',
			players: PlayerListUtils.getFavoritedPlayers(rankedBatters, 'batter')
		},
		{
			type: 'pitcher',
			players: PlayerListUtils.getFavoritedPlayers(rankedPitchers, 'pitcher')

		}]

	return {
		lists
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritePlayerListsContainer);

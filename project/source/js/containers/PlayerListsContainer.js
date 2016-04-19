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

import PlayerList from '../components/PlayerList.js'
import PlayerInput from '../components/PlayerInput'
import ActivePlayer from './ActivePlayer'
import ListFilters from '../components/ListFilters'

import {filterBy} from '../helpers/filterUtils';

import '../../stylesheets/components/player-list.scss'

class PlayerListsContainer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filter: {property: 'type', value: 'batter'},
			searchQuery: null
		}
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}


	togglePlayerList (e) {
		var property = e.target.getAttribute('data-param');
		var value = e.target.getAttribute('data-value');

		var filter = {
			property,
			value
		}

		if (this.state.filter === filter) {
			return;
		}

		this.setState({
			filter
		})
	}

	shouldComponentUpdate (nextProps, nextState) {
		console.log('trying to update PlayerLists')
		var stringifiedNextProps = JSON.stringify(nextProps)
		var stringifiedProps = JSON.stringify(this.props)
		var stringifiedNextState = JSON.stringify(nextState)
		var stringifiedState = JSON.stringify(this.state)

		return (stringifiedNextProps != stringifiedProps || stringifiedNextState != stringifiedState)
	}

	componentDidUpdate () {
		console.log ('player lists updated');
	}

	getType () {
		var filter = this.state.filter;
		var categoryType;
		switch (filter.value) {
			case 'batter':
			case '1B':
			case '2B':
			case '3B':
			case 'SS':
			case 'OF':
			case 'C':
				categoryType = 'batter'
				break;
			case 'pitcher':
			case 'SP':
			case 'RP':
				categoryType = 'pitcher'
				break;
		}
		return categoryType
	}

	getCategories (type) {
		if (!this.props.categories) {
			return;
		}
		return SettingsUtils.getCategories( this.props.categories[type] )
	}

	getPlayers (type) {

		var players = this.getFilteredPlayers(type);

		if (this.state.searchQuery) {
			players = this.getSearchResults(players);
		}

		return players;
	}

	getFilteredPlayers (type) {
		var players = this.props.players;

		if (!players) {
			return;
		}

		var filteredPlayers = filterBy(players, 'type', type);

		filteredPlayers = filteredPlayers.length === 0 ? players : filteredPlayers;

		console.log(filteredPlayers.length)
		return filteredPlayers.filter( player => player.value );
	}

	getSearchResults (players) {
		return PlayerListUtils.getMatchingPlayers(players, this.state.searchQuery)
	}

	setSearchQuery (value) {
		if (value.length > 1) {
			this.setState({searchQuery: value})
		} else {
			this.setState({searchQuery: null})
		}

	}

	getFilters () {
		if (!this.props.positions) {
			return;
		}

		var filters = [ { property: 'type', value: 'all', text:'all players' } ];

		this.props.positions.map(function (positionType) {

			filters.push( {property: 'type', value: positionType.type, text: positionType.type + 's'} );

			positionType.positions.map( (position, index) => {
				var className = ((index + 1) % 3 === 0) ? 'last' : null
				filters.push( {property: 'pos', value: position.name, className} );
			})
		})

		return filters
	}

	render () {
		var loading = classNames({'is-loading': this.props.isLoading});

		return (
			<div className='player-lists-container'>
				<div className='player-lists-header'>
					<ActivePlayer />
					<PlayerInput
						searchablePlayers={PlayerListUtils.getUnusedPlayers(this.props.players)}
						searchableTeams={this.props.teams}
						playerEntered={this.props.actions.assignPlayer} />
				</div>
				<div>

					<div className='player-lists-main'>
						<div className={loading}>
							<PlayerList
								type={'batter'}
								players={this.getPlayers('batter')}
								categories={this.getCategories('batter')}
								sortPlayers={this.props.actions.sortPlayers}
								playerSelected={this.props.actions.updateActivePlayer}
								hideValueInfo={false}
								updateStat={this.props.actions.updatePlayerStat}
								updateCost={this.props.actions.updatePlayerCost}
								updateFavorited={this.props.actions.updatePlayerFavorited} />

							<PlayerList
								type={'pitcher'}
								players={this.getPlayers('pitcher')}
								categories={this.getCategories('pitcher')}
								sortPlayers={this.props.actions.sortPlayers}
								playerSelected={this.props.actions.updateActivePlayer}
								hideValueInfo={false}
								updateStat={this.props.actions.updatePlayerStat}
								updateCost={this.props.actions.updatePlayerCost}
								updateFavorited={this.props.actions.updatePlayerFavorited} />
						</div>
					</div>
				</div>
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

	if (!state.players.data || !state.categories.data || !state.teams.data) {
		return {}
	}

	var players = state.players.data,
		categories = state.categories.data,
		teams = SettingsUtils.getTeamNames( state.teams.data ),
		positions = state.positions.data;

	return {
		players,
		teams,
		categories,
		positions,
		isLoading: state.players.isLoading
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerListsContainer);
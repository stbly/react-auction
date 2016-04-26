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
			hideDraftedPlayers: false,
			searchQuery: null
		}
	}

	componentWillReceiveProps(nextProps) {
		this.props.actions.fetchPlayersIfNeeded()
	}

	toggleHideDraftedPlayers () {
		this.setState({hideDraftedPlayers: !this.state.hideDraftedPlayers})
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

		var stringifiedNextProps = JSON.stringify(nextProps)
		var stringifiedProps = JSON.stringify(this.props)
		var stringifiedNextState = JSON.stringify(nextState)
		var stringifiedState = JSON.stringify(this.state)

		return (stringifiedNextProps != stringifiedProps || stringifiedNextState != stringifiedState)
	}

	componentDidUpdate () {
		// console.log ('player lists updated');
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

	getCategories () {
		if (!this.props.categories) {
			return;
		}
		return SettingsUtils.getCategories( this.props.categories[this.getType()] )
	}

	getPlayers () {

		var players = this.getFilteredPlayers();

		if (this.state.searchQuery) {
			players = this.getSearchResults(players);
		}

		return players;
	}

	getFilteredPlayers () {
		var players = this.props.players;

		if (!players) {
			return;
		}

		var filteredPlayers = filterBy(players, this.state.filter.property, this.state.filter.value);

		// console.log(filteredPlayers);
		filteredPlayers = filteredPlayers.length === 0 ? players : filteredPlayers;

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

		filters.push({property:'isFavorited', text:'Favorited'})

		return filters
	}

	render () {
		var loading = classNames({'is-loading': this.props.isLoading});

		return (
			<div className='player-lists-container'>
				<section>
					<div className='player-lists-header'>
						<ActivePlayer />
						<PlayerInput
							searchablePlayers={PlayerListUtils.getUnusedPlayers(this.props.players)}
							searchableTeams={this.props.teams}
							playerEntered={this.props.actions.assignPlayer} />
					</div>
					<div className='hide-selected-container'>
						<input className='hide-selected-toggle'
							ref={(ref) => this.hideSelectedToggle = ref}
							type="checkbox"
							checked={this.state.hideDraftedPlayers}
							onChange={this.toggleHideDraftedPlayers.bind(this)} />

						<span className='hide-selected-text'>Hide Drafted Players</span>
					</div>
				</section>
				<section>
					<ListFilters
						activeFilter={this.state.filter.value}
						searchQuery={this.state.searchQuery}
						setSearchQuery={this.setSearchQuery.bind(this)}
						filterSelected={this.togglePlayerList.bind(this)}
						filters={this.getFilters()} />

					<div className='player-lists-main'>
						<div className={loading}>
							<PlayerList
								type={this.getType()}
								players={this.getPlayers()}
								categories={this.getCategories()}
								sortPlayers={this.props.actions.sortPlayers}
								playerSelected={this.props.actions.updateActivePlayer}
								hideDraftedPlayers={this.state.hideDraftedPlayers}
								hideValueInfo={false}
								updateStat={this.props.actions.updatePlayerStat}
								updateCost={this.props.actions.updatePlayerCost}
								updateFavorited={this.props.actions.updatePlayerFavorited} />
						</div>
					</div>
				</section>
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

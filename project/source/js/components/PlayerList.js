import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

import classNames from 'classnames'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import Player from './Player.js'
import {sortBy} from '../helpers/sortUtils';

import '../../stylesheets/components/player-list.scss'



class PlayerList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			toggleSortDirection: true,
			currentSortOption: 'adjustedValue',
			sortedPlayers: null,
		}
	}

	componentDidUpdate () {
	}

	componentWillReceiveProps (nextProps) {
		// console.log('sort options:',this.state.currentSortOption)
		var playersToSort = nextProps.players;

		if (this.state.currentSortOption) {
			// console.log('--1',this.state.currentBatterSortOption);
			// console.log ('--2',this.state.toggleBatterSortDirection);
			playersToSort = sortBy(playersToSort, this.state.currentSortOption, this.state.toggleSortDirection)
			this.setState({sortedPlayers: playersToSort})
		}
	}

	sortList (e) {
		var param = e.target.getAttribute('data-name');
		if (param === 'name' || param === 'cost' || param === 'pos') {
			param = [
				{ param: param },
				{ param: 'adjustedValue', direction: -1 }
			];
		}

		if (param === 'isFavorited') {
			param = [
				{ param: 'isFavoritedRank' }
			]
		}

		var playersToSort = this.props.players;
		var sortDirection = this.state.toggleSortDirection;
		var currentSortOption = this.state.currentSortOption;

		if (param.toString() === currentSortOption.toString()) {
			sortDirection = !sortDirection;
			this.setState({toggleSortDirection: sortDirection});
		}

		this.setState({currentSortOption: param});
		playersToSort = sortBy(playersToSort, param, sortDirection);
		// console.log(playersToSort)

		this.setState({sortedPlayers: playersToSort})

		// this.props.sortPlayers(playersToSort);
	}

	getCategories () {
		var categories = [];

		if (this.props.hideCategories || !this.props.categories) {
			return;
		}

		if (this.props.categories.length > 0) {
			for(var key in this.props.categories) {
				if (this.props.categories.hasOwnProperty(key)) {
					var category = this.props.categories[key];
					categories.push(
						<td onClick={this.sortList.bind(this)} data-name={category.abbreviation} key={key} className='player-info stat'>{category.abbreviation}</td>
					)
				}
			}
		} else {

		}

		return categories;
	}

	getPlayers () {
		// console.log('sorted:',this.state.sortedPlayers)

		var playerList = this.state.sortedPlayers || this.props.players;

		if (!playerList) {
			return;
		}

		var props = this.props;

		var rankedPlayers = sortBy(playerList, 'adjustedValue', 'desc')

		rankedPlayers.map( (player,index) => {
			player.rank = index + 1
			return player
		})

		if (this.props.hideDraftedPlayers) {
			rankedPlayers = rankedPlayers.filter( player => !player.cost )
		}

		rankedPlayers = sortBy(rankedPlayers, this.state.currentSortOption, this.state.toggleSortDirection)

		return rankedPlayers.map(function (player, index) {
			return (
				<Player
					key={index}
					rank={player.rank}
					player={player}
					categories={props.categories}
					playerSelected={props.playerSelected}
					hideMetaInfo={props.hideMetaInfo}
					hidePlayerInfo={props.hidePlayerInfo}
					hideCostInput={props.hideCostInput}
					hideValueInfo={props.hideValueInfo}
					updateStat={props.updateStat}
					updateCost={props.updateCost}
					updateFavorited={props.updateFavorited} />
			)
		})
	}

	getMetaInfo () {
		if(this.props.hideMetaInfo) {
			return;
		}
		var smallCell = {
			'width': '5%'
		};

		return ([
			<td className='player-info' key={'rank'} style={smallCell} onClick={this.sortList.bind(this)} data-name='rank'>#</td>,
			<td className='player-info favorite-toggle' key={'favorite'} style={smallCell}>*</td>
		])
	}

	getPlayerInfo () {
		if (this.props.hidePlayerInfo) {
			return;
		}

		return ([
			<td key={'player-pos'} className='player-info pos' onClick={this.sortList.bind(this)} data-name='pos'>Pos</td>,
			<td key={'player-name'} className='player-info name' onClick={this.sortList.bind(this)} data-name='name'>Name</td>
		])
	}

	getValueInfo () {
		var els = [];
		if (!this.props.hideCostInput) {
			els.push(<td className='player-info value-info'  key={'player-cost'} onClick={this.sortList.bind(this)} data-name='cost'>Cost</td>)
		}
		if (!this.props.hideValueInfo) {
			els.push(<td className='player-info value-info'  key={'player-adjusted-value'}onClick={this.sortList.bind(this)} data-name='adjustedValue'>Bid</td>)
			els.push(<td className='player-info value' key={'player-value'} onClick={this.sortList.bind(this)} data-name='value'>Val</td>);
		}
		return els;
	}

	render () {
		var listClass = classNames('player-list', this.props.type);
		return (
			<div className='player-list-container'>
				<table className={listClass}>
					<tbody>
						<tr className='headings'>
							{this.getMetaInfo()}
							{this.getPlayerInfo()}
							{this.getValueInfo()}
							{this.getCategories()}
						</tr>

						{this.getPlayers()}

					</tbody>
				</table>
			</div>

		)
	}
}

export default PlayerList;

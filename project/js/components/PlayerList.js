import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import Player from './Player.js'

import '../../stylesheets/components/player-list.scss'



class PlayerList extends Component {
	constructor(props) {
		super(props)
	}

	sortList (e) {
		var param = e.target.getAttribute('data-name');
		if (param === 'name' || param === 'cost' || param === 'pos') {
			param = [param, 'value'];
		}
		this.props.sortPlayers(param);
	}

	getCategories () {
		var categories = [];

		for(var key in this.props.categories) {
			if (this.props.categories.hasOwnProperty(key)) {
				var category = this.props.categories[key];
				categories.push(
					<td onClick={this.sortList.bind(this)} data-name={category.abbreviation} key={key} className='player-info stat'>{category.abbreviation}</td>
				)
			}
		}

		return categories;
	}

	getPlayers () {
		var players = [];
		for(var key in this.props.players) {
			if (this.props.players.hasOwnProperty(key)) {
				var player = this.props.players[key]
				// console.log(key);
				players.push(
					<Player
						key={key}
						player={player}
						categories={this.props.categories}
						updateStat={this.props.updateStat}
						updateCost={this.props.updateCost} />
				)
			}
		}

		return players;
	}

	render () {
		var listClass = classNames('player-list', this.props.type);
		var smallCell = {
			'width': '5%'
		};
		return (
			<div className='player-list-container'>
				<table className={listClass}>
					<tbody>
						<tr className='headings'>
							<td className='player-info' style={smallCell} onClick={this.sortList.bind(this)} data-name='rank'>Rank</td>
							<td className='player-info favorite-toggle' style={smallCell}>Star</td>
							<td className='player-info name' onClick={this.sortList.bind(this)} data-name='name'>Name</td>
							<td className='player-info' onClick={this.sortList.bind(this)} data-name='pos'>Position</td>
							<td className='player-info value-info' onClick={this.sortList.bind(this)} data-name='inflatedValue'>Bid Price</td>
							<td className='player-info value-info' onClick={this.sortList.bind(this)} data-name='cost'>Cost</td>
							<td className='player-info value' onClick={this.sortList.bind(this)} data-name='value'>Value</td>
							<td className='player-info value' onClick={this.sortList.bind(this)} data-name='inflatedValue'>Inflation Value</td>
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

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

	getCategories () {
		var categories = [];

		for(var key in this.props.categories) {
			if (this.props.categories.hasOwnProperty(key)) {
				var category = this.props.categories[key];
				categories.push(
					<td key={key} className='stat'>{category.abbreviation}</td>
				)
			}
		}

		return categories;
	}

	getPlayers () {
		var players = [];
		var index = 1;
		for(var key in this.props.players) {
			if (this.props.players.hasOwnProperty(key)) {
				var player = this.props.players[key]
				players.push(
					<Player key={key} id={key} player={player} rank={index} categories={this.props.categories}/>
				)
				index++
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
			<table className={listClass}>
				<tbody>

					<tr className='headings'>
						<td className='player-info' style={smallCell}>Rank</td>
						<td className='player-info favorite-toggle' style={smallCell}>Star</td>
						<td className='player-info name'>Name</td>
						<td className='player-info position'>Position</td>
						<td className='player-info value-info'>Cost</td>
						<td className='player-info value'>Value</td>
						<td className='player-info value'>Inflation Value</td>
						{this.getCategories()}
					</tr>

					{this.getPlayers()}

				</tbody>
			</table>

		)
	}
}

export default PlayerList;

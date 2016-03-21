import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/player.scss'

class Player extends Component {
	constructor (props) {
			super(props)
	}

	componentDidMount() {
	}

	getStats () {
		var stats = [];

		for(var key in this.props.categories) {
			if (this.props.categories.hasOwnProperty(key)) {
				var category = this.props.categories[key].abbreviation;
				var stat = this.props.player[category];
				var ratioStat = (category === 'AVG' || category === 'OBP' || category === 'SLG' || category === 'OPS' || category === 'ERA' || category === 'WHIP');
				var decimalPlaces = ratioStat ? 3 : 0;
				stats.push(
					<td key={key} className='stat'>{stat.toFixed(decimalPlaces)}</td>
				)
			}
		}
		return stats;
	}

	render () {
		return (
			<tr className='player'>
				<td>{this.props.player.id}</td>
				<td className='favorite-toggle'></td>
				<td>{this.props.player.name}</td>
				<td>{this.props.player.pos}</td>
				<td>{this.props.player.sgp}</td>
				<td>{this.props.player.value}</td>
				<td>{this.props.player.valueInflated}</td>
				{this.getStats()}
			</tr>
		)
	}
}

Player.propTypes = {

}

export default Player;

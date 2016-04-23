import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import PlayerList from './PlayerList.js'

import '../../stylesheets/components/player-list.scss'



class ValueList extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		return (
			<PlayerList
				type={this.props.type}
				players={this.props.players}
				categories={this.props.categories}
				sortPlayers={this.props.sortPlayers}
				playerSelected={this.props.playerSelected}
				hideValueInfo={false}
				updateStat={this.props.updateStat}
				updateCost={this.props.updateCost}
				updateFavorited={this.props.updateFavorited} />
				/*<table className={listClass}>
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
				</table>*/

		)
	}
}

export default ValueList;

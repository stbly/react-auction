import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import Player from './Player.js'
import PlayerList from './PlayerList.js'
import {sortBy} from '../helpers/sortUtils';

class FavoritedPlayerList extends PlayerList {
	constructor(props) {
		super(props)
	}

	getPlayers () {
		var players = [];
		// console.log('sorted:',this.state.sortedPlayers)
		var playerList = this.state.sortedPlayers || this.props.players;

		if (!playerList) {
			return;
		}

		for(var key in playerList) {
			if (playerList.hasOwnProperty(key)) {
				var player = playerList[key]
				// console.log(key);
				players.push(
					<Player
						key={key}
						player={player}
						playerSelected={this.props.playerSelected}
						hideMetaInfo={true}
						hideCostInput={true}
						hideValueInfo={true}
						hideStats={true} />
				)
			}
		}

		return players;
	}

	render () {
		var listClass = classNames('favorited-player-list', this.props.type);

		return (
			<div className='player-list-container'>
				<table className={listClass}>
					<tbody>
						<tr>
							<td className='list-type' colSpan={3}>{(this.props.type + 's').toUpperCase()}</td>
						</tr>
						<tr className='headings'>
							<td className='player-info' onClick={this.sortList.bind(this)} data-name='pos'>Pos</td>
							<td className='player-info name' onClick={this.sortList.bind(this)} data-name='name'>Name</td>
							<td className='player-info value-info' onClick={this.sortList.bind(this)} data-name='inflatedValue'>Bid</td>
						</tr>

						{this.getPlayers()}

					</tbody>
				</table>
			</div>

		)
	}
}

export default FavoritedPlayerList;

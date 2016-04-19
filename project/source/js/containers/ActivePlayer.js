import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import PlayerList from '../components/PlayerList'
import * as SettingsUtils from '../helpers/SettingsUtils'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

// import '../stylesheets/components/active-player.scss'

class ActivePlayer extends Component {
	constructor(props) {
		super(props)
	}

	determineValueFields() {
		if (this.props.activePlayer.cost) {
			return this.getPlayerCost()
		} else {
			return this.getPlayerValue()
		}
	}

	getPlayerValue () {
		return (
			<div className='player-value'>
				<span className='dollar-amount'>
					{this.props.activePlayer.adjustedValue.toFixed(0)}
				</span>
			</div>
		)
	}

	getPlayerCost () {
		console.log(this.props.activePlayer);
		return (
			<div>
				<div className='player-cost'>
					Drafted for <span className='dollar-amount'>{this.props.activePlayer.cost}</span>
				</div>
			</div>
		)
	}

	getOwner () {
		if (this.props.activePlayer.team) {
			return <h3 className='team-name'>Owner: {this.props.activePlayer.team}</h3>
		}
		return;
	}

	render () {
		if (!this.props.activePlayer) {
			return <div></div>
		}

		var type = this.props.activePlayer.type
		var activePlayerClasses = classNames('active-player',type)
		var tableClasses = classNames('player-list',type)
		var categories = SettingsUtils.getCategories( this.props.categories[type])

		return (
			<div className={activePlayerClasses}>
				<div className='player-avatar'>
					<image src={require("../../images/player-image.png")}  />
				</div>
				<div className='player-info-panel'>
					<div className='player-info'>
						<h2 className='player-meta'>
							{this.props.activePlayer.pos}
						</h2>
						<h1 className='player-name'>
							{this.props.activePlayer.name}
						</h1>
						{this.determineValueFields()}
						{this.getOwner()}
					</div>
					<div className='player-news'>
						<h2>Player News</h2>
						<p>Jean-François Champollion colonies. Paroxysm of global death emerged into consciousness worldlets, Sea of Tranquility. Laws of physics a very small stage in a vast cosmic arena tesseract prime number.</p>
					</div>
					<PlayerList
						hideMetaInfo={true}
						hideValueInfo={true}
						hidePlayerInfo={true}
						hideCostInput={true}
						players={[this.props.activePlayer]}
						categories={categories}/>
				</div>
			</div>
		)
	}
}

/*
function mapDispatchToProps(dispatch) {

}
*/

function mapStateToProps (state,ownProps) {
	return {
		activePlayer: state.players.activePlayer,
		categories: state.categories.data,
	};
}

export default connect(mapStateToProps)(ActivePlayer);

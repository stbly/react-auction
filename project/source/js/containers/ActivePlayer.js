import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import PlayerList from '../components/PlayerList'
import PlayerNotes from '../components/PlayerNotes'
import Icon from '../components/Icon'
import * as SettingsUtils from '../helpers/SettingsUtils'
import * as playerActions from '../redux/modules/players'

import player from '../../images/player-image.png'


// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import '../../stylesheets/components/active-player.scss'

class ActivePlayer extends Component {
	constructor(props) {
		super(props)
	}


	togglePlayerFavorited (e) {
		if (this.props.actions.updatePlayerFavorited) {
			this.props.actions.updatePlayerFavorited(this.props.activePlayer.id);
		}
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.playerNews) {
			// this.playerNews.style.height = this.playerInfo.offsetHeight
		}
	}

	updatePlayerNotes (notes) {
		this.props.actions.updatePlayerNotes(this.props.activePlayer.id, notes)
	}

	render () {
		if (!this.props.activePlayer) {
			return <div></div>
		}

		var type = this.props.activePlayer.type
		var activePlayerClasses = classNames('active-player',type)
		var tableClasses = classNames('player-list',type)
		var categories = SettingsUtils.getCategories( this.props.categories[type])

		var watchClasses = classNames('icon-button', {active: this.props.activePlayer.isFavorited})
		var avoidClasses = classNames('icon-button', {active: this.props.activePlayer.isAvoided});

		var draftedEl = (
			<div>
				<div className='player-cost'>
					Drafted for <span className='dollar-amount'>{this.props.activePlayer.cost}</span>
				</div>
			</div>
		)

		var undraftedEl = (
			<div className='player-value'>
				<span className='dollar-amount'>
					{this.props.bidPrice}
				</span>
				<div className='player-buttons'>
					<button className={watchClasses}
						onClick={this.togglePlayerFavorited.bind(this)}>
							<Icon type={'watch'} />
					</button>
					<button className={avoidClasses}><Icon type={'avoid'} /></button>
				</div>
			</div>
		)

		var costEl = this.props.activePlayer.cost ? draftedEl : undraftedEl

		var ownerEl;
		if (this.props.activePlayer.team) {
			ownerEl = <h3 className='team-name'>Owner: {this.props.activePlayer.team}</h3>
		}

		return (
			<div className={activePlayerClasses}>
				<div className='player-avatar'>
					<image src={player}  />
				</div>
				<div className='player-info-panel'>
					<div className='upper-panel'>
						<div className='player-info-container' ref={(ref) => this.playerInfo = ref}>
							<h2 className='player-meta'> {this.props.activePlayer.pos} </h2>
							<h1 className='player-name'> {this.props.activePlayer.name} </h1>
							{costEl}
							{ownerEl}
						</div>
						<div className='player-news-container' ref={(ref) => this.playerNews = ref}>
							<h2>Player News</h2>
							<div className='player-news'>
								<p>Jean-François Champollion colonies. Paroxysm of global death emerged into consciousness worldlets, Sea of Tranquility. Laws of physics a very small stage in a vast cosmic arena tesseract prime number.</p>
							</div>
							<PlayerNotes
								notes={this.props.activePlayer.notes}
								notesWereUpdated={this.updatePlayerNotes.bind(this)} />
						</div>
					</div>
					<div className='clear-both'></div>
					<div className='lower-panel'>
						<PlayerList
							hideMetaInfo={true}
							hideValueInfo={true}
							hidePlayerInfo={true}
							hideCostInput={true}
							players={[this.props.activePlayer]}
							categories={categories}/>
					</div>
				</div>
			</div>
		)
	}
}

/*
function mapDispatchToProps(dispatch) {

}
*/


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(playerActions, dispatch)
    }
}

function mapStateToProps (state,ownProps) {
	var activePlayer, bidPrice;

	if (state.players.activePlayerId) {
		activePlayer = state.players.data.filter( player => (player.id === state.players.activePlayerId))[0]
		bidPrice = activePlayer.adjustedValue.toFixed(0)
	}

	return {
		activePlayer,
		bidPrice,
		categories: state.categories.data
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivePlayer);

import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

// import PlayerList from '../components/PlayerList'
import PlayerNotes from '../components/PlayerNotes'
import IconButton from '../components/IconButton'
import * as SettingsUtils from '../helpers/SettingsUtils'
import {primaryPositionFor} from '../helpers/PlayerListUtils';
import * as playerActions from '../redux/modules/players'
import {Table} from 'reactable-cacheable'

import playerImage from '../../images/player-image.png'

import { createStatCells, createHeaderRow, createRows } from '../helpers/tableUtils'

// import '../../stylesheets/components/active-player.scss'

class ActivePlayer extends Component {
	constructor(props) {
		super(props)
	}


	togglePlayerFavorited (e) {
		const { player, updateFavorited } = this.props

		updateFavorited(player.id);
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.playerNews) {
			// this.playerNews.style.height = this.playerInfo.offsetHeight
		}
	}

	updatePlayerNotes (notes) {
		const { player, updateNotes } = this.props

		updateNotes(player.id, notes)
	}

	getColumns () {
		const { positionData, player, actions, updateStat } = this.props
		const { categories } = positionData[ player.type ]

		return createStatCells(categories, updateStat)
	}

	render () {
		const { player, positionData} = this.props
		const { type, name, cost, isAvoided } = player
		const columns = this.getColumns()

		const playerClasses = classNames('active-player',type)
		const tableClasses = classNames('player-list',type)

		return (
			<div className={playerClasses}>
				<div className='player-avatar'>
					<image src={ playerImage } />
				</div>
				<div className='player-info-panel'>
					<div className='upper-panel'>
						<div className='player-info-container' ref={(ref) => this.playerInfo = ref}>
							<h2 className='player-meta'> { primaryPositionFor(player) } </h2>
							<h1 className='player-name'> { name } </h1>
							{ this.renderCostInfo() }
							{ this.renderTeam() }
						</div>
						<div className='player-news-container' ref={(ref) => this.playerNews = ref}>
							<h2>Player News</h2>
							<div className='player-news'>
								<p>Jean-François Champollion colonies. Paroxysm of global death emerged into consciousness worldlets, Sea of Tranquility. Laws of physics a very small stage in a vast cosmic arena tesseract prime number.</p>
							</div>
							<PlayerNotes
								notes={player.notes}
								notesWereUpdated={this.updatePlayerNotes.bind(this)} />
						</div>
					</div>
					<div className='clear-both'></div>
					<div className='lower-panel'>
						<Table
							ref={(ref) => this.table = ref}
							className={tableClasses} >
								{ createHeaderRow(columns) }
								{ createRows([player], columns) }
						</Table>
					</div>
				</div>
			</div>
		)
	}

	renderCostInfo () {
		return this.props.player.cost ? this.renderDraftedElement() : this.renderUnDraftedElement()
	}

	renderDraftedElement () {
		const { cost } = this.props.player

		return (
			<div>
				<div className='player-cost'>
					Drafted for <span className='dollar-amount'>{cost}</span>
				</div>
			</div>
		)
	}

	renderUnDraftedElement () {
		// const avoidClasses = classNames('icon-button', {active: isAvoided});
		const { adjustedValue, isFavorited, isAvoided } = this.props.player

		return (
			<div className='player-value'>
				<span className='dollar-amount'>
					{ adjustedValue.toFixed(0) }
				</span>
				<div className='player-buttons'>
					<IconButton
						toggleButton={this.togglePlayerFavorited.bind(this)}
						isActive={isFavorited}
						type={'watch'} />
					<IconButton
						isActive={isAvoided}
						type={'avoid'} />
				</div>
			</div>
		)
	}

	renderTeam () {
		const { team } = this.props.player
		if (!team) return

		return (
			<h3 className='team-name'>
				Owner: {team}
			</h3>
		)
	}
}

ActivePlayer.propTypes = {
	player: PropTypes.object.isRequired,
	positionData: PropTypes.object.isRequired,
	updateStat: PropTypes.func.isRequired,
	updateFavorited: PropTypes.func.isRequired,
	updateNotes: PropTypes.func.isRequired,	
}

export default ActivePlayer;

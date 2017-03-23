import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import classNames from 'classnames';
import { Table, Tfoot } from 'reactable-cacheable'
import { primaryPositionFor, getCategories } from '../helpers/PlayerListUtils'

import { 
		createRows, 
		createHeaderRow, 
		createCells,
		sortCost, 
		sortNumber, 
		sortPosition, 
		cellFactory, 
		earnedCellFactory,
		valueCellFactory, 
		costCellFactory, 
		createStatCells} from '../helpers/tableUtils'

import { getStatTotals } from '../helpers/statUtils'

import InputToggle from './InputToggle'

import '../../stylesheets/components/team.scss'
import '../../stylesheets/components/player-list.scss'

class Team extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { players } = this.props
		const classes = classNames('roster')
		
		return (
			<div className={classes}>
				{ players ? this.renderPlayers() : null}
			</div>
		)
	}

	renderPlayers () {
		const { players, positionData, type, onRowClick } = this.props

		const { categories } = positionData
		const displayCategories = getCategories(categories)

		const playerObject = Array.toObject(players)
		const categoryCells = createStatCells(displayCategories)
		const columns = [
			valueCellFactory('budget', 'budget', true),
			cellFactory('position', {className: 'hidden', valueFunction: primaryPositionFor}),
			cellFactory('name', {isText: true, className: 'widen'}),
			earnedCellFactory(),
			cellFactory('type', {className: 'hidden'}),
			costCellFactory(),
			// valueCellFactory('adjustedValue', 'bid', true),
			valueCellFactory('value', 'val', true),
			...categoryCells
		]

		const sorts = [ 
			sortNumber('budget'),
			sortCost(playerObject), 
			'rank', 
			'name', 
			'earned', 
			// sortNumber('bid'),
			sortNumber('val'),
			sortPosition(playerObject),
			...Object.keys(categories)
		]

		const headers = createHeaderRow(columns)
		const rows = createRows(players, columns, null, { 
			onClick: (player) => { 
				if (!player) return 
				const { id } = player;
				(onRowClick && id) ? onRowClick(id) : null 
			}
		})

		const sumRow = this.getSumRow(players, displayCategories);

		return <Table
			className={classNames('player-list', type)}
			sortable={sorts}
			defaultSort='budget'>
				{headers}
				{rows} 
				<Tfoot>
					{sumRow}
				</Tfoot>
		</Table> 
	}

	getSumRow (playerRows, categories) {
		if (playerRows.length === 0) return 
		const playersWithValue = playerRows.filter( row => row.value )
		if (!playersWithValue || playersWithValue.length === 0) return

		const categoryCells = createStatCells(categories)

		const columns = [
			earnedCellFactory(),
			costCellFactory(),
			// valueCellFactory('adjustedValue', 'bid', true),
			valueCellFactory('value', 'val', true),
			...categoryCells
		]

		const sumObject = {}
		const valueCategories = ['cost', 'adjustedValue', 'value'];
	
		if (playersWithValue.length > 0) {
			valueCategories.forEach( category => {
				sumObject[category] = playersWithValue.map( player => {
					return player[category]
				}).reduce( (a, b) => a + b);
			})
		}


		sumObject.earned = playersWithValue.map( player => {
			return player.value - player.cost
		}).reduce( (a, b) => a + b)

		const statTotals = getStatTotals(playersWithValue, categories)

		sumObject.stats = statTotals;	

		return (
			<tr key={'sums'}>
				<td colSpan={2}></td>
				{ createCells(sumObject, columns) }
			</tr>
		)
	}

}

Team.propTypes = {
	players: PropTypes.array,
	positionData: PropTypes.object,
	onRowClick: PropTypes.func
}

export default Team
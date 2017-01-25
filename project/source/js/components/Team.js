import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import { 
		createRows, 
		createHeaderRow, 
		createCells,
		sortCost, 
		sortNumber, 
		sortPosition, 
		cellFactory, 
		nameCellFactory, 
		valueCellFactory, 
		costCellFactory, 
		positionCellFactory, 
		createStatCells} from '../helpers/tableUtils'

import classNames from 'classnames';

import InputToggle from './InputToggle'
import { Table, Tfoot } from 'reactable-cacheable'

import { addAllNormalStatValuesOfTypeForPlayers, addAllRatioStatValuesOfTypeForPlayers } from '../helpers/statUtils'

import '../../stylesheets/components/team.scss'

class Team extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { name, players, onChangeTeamName, onResetPlayers } = this.props
		const classes = classNames('team', 'team-' + name)
		
		return (
			<div className={classes}>
				<div className='team-name'>
					<InputToggle type='string' value={name} valueDidChange={onChangeTeamName} />
				</div>
				<div>
					{ players ? this.renderPlayers() : null}
				</div>
				<button onClick={onResetPlayers}>Reset All Players</button>
			</div>
		)
	}

	renderPlayers () {
		const { players, positionData } = this.props

		return Object.keys(positionData).map( position => {
			const filteredPlayers = players.filter( player => {
				return player.type === position
			})

			const playerObject = Array.toObject(filteredPlayers)
			const categories = positionData[position].categories
			const categoryCells = createStatCells(categories)
			const columns = [
				positionCellFactory(),
				nameCellFactory(),
				cellFactory('type', {className: 'hidden'}),
				costCellFactory(),
				valueCellFactory('adjustedValue', 'bid', true),
				valueCellFactory('value', 'val', true),
				...categoryCells
			]

			const sorts = [ 
				sortCost(playerObject), 
				'rank', 
				'name', 
				sortNumber('bid'),
				sortNumber('val'),
				sortPosition(playerObject),
				...Object.keys(categories)
			]

			const sumRow = this.getSumRow(filteredPlayers, categories);

			// const sumRow = (
			// 	<Row>
			// 		<Cell value={statSumCalculation(filteredPlayers, )}></Cell>
			// 	</Row>
			// )

			const headers = createHeaderRow(columns)
			const rows = createRows(filteredPlayers, columns)

			return <Table
				key={position}
				className={classNames('player-list',position)}
				sortable={sorts}
				defaultSort='position' >
					{headers}
					{rows} 
					<Tfoot>
						{sumRow}
					</Tfoot>
			</Table> 

			// const positionFilters = positions.map( positionId => createNameMatchFilter('position', {label: positionId}) )
			// return [typeFilter, ...positionFilters]
		})		
	}

	getSumRow (players, categories) {
		if (players.length === 0) return 

		const categoryCells = createStatCells(categories)

		const columns = [
			costCellFactory(),
			valueCellFactory('adjustedValue', 'bid', true),
			valueCellFactory('value', 'val', true),
			...categoryCells
		]

		const sumObject = {}
		const valueCategories = ['cost', 'adjustedValue', 'value'];

		valueCategories.forEach( category => {
			sumObject[category] = players.map( player => player[category]).reduce( (a, b) => a + b);
		})

		const statObject = {}
		Object.keys(categories).map( category => {
			const { isRatio, denominator, perPeriod } = categories[category];
			const statCalculation = isRatio ? addAllRatioStatValuesOfTypeForPlayers : addAllNormalStatValuesOfTypeForPlayers;
			let params = [players, category];
			if (isRatio) {
				params.push(denominator, perPeriod);
			}
			statObject[category] = statCalculation(...params);
		})			

		sumObject.stats = statObject;	

		return (
			<tr key={'sums'}>
				<td colSpan={2}></td>
				{ createCells(sumObject, columns) }
			</tr>
		)
	}

}

Team.propTypes = {
	name: PropTypes.string.isRequired,
	players: PropTypes.array,
	positionData: PropTypes.object,
	onChangeTeamName: PropTypes.func,
	onResetPlayers: PropTypes.func
}

export default Team
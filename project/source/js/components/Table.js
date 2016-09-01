import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'

import {sortBy} from '../helpers/arrayUtils';

import TableRow from './TableRow.js'
import TableCell from './TableCell.js'

class PlayerList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			reverseSortDirection: true,
			sortParam: 'adjustedValue',
		}
	}

	getSortParam ( param ) {
		const { sortingRules } = this.props
		if (!sortingRules) return param

		const sortingRule = sortingRules[param]
		return sortingRule ? sortingRule(param) : param
	}

	sortList (list) {
		const { sortParam, reverseSortDirection } = this.state

		const param = this.getSortParam(sortParam)
		return sortBy(list, sortParam, reverseSortDirection)
	}

	setSortList (param) {
		const { dataToSort, sortParam, reverseSortDirection } = this.state
		const { data } = this.props

		const oldParam = JSON.stringify(sortParam)
		const newParam = JSON.stringify(param)

		const directionSwitch = (oldParam === newParam)
		const newDirection = directionSwitch ? !reverseSortDirection : reverseSortDirection

		this.setState({
			sortParam: param,
			reverseSortDirection: newDirection
		});
	}

	rankData (data) {
		const dataSortedByValue = sortBy(data, 'adjustedValue', 'desc')
		const rankedData = dataSortedByValue.map( (player, index) => {
			return Object.assign({}, player, {
				rank: index + 1
			})
		})

		return this.sortList(rankedData)
	}

	getData () {
		const { data, hideDraftedPlayers } = this.props

		const playerList = this.sortList(data) //this.state.sortedData || data;

		let rankedData = this.rankData(playerList)
		if (hideDraftedPlayers) {
			rankedData = rankedData.filter( player => !player.cost )
		}

		return rankedData
	}


	render () {
		var listClass = classNames('player-list');

		return (
			<div className='player-list-container'>
				<table className={listClass}>
					<tbody>
						{this.renderHeaders()}
						{this.renderRows()}
					</tbody>
				</table>
			</div>

		)
	}


	renderHeaders () {
		const { columns } = this.props
		const cells = columns.map(
			column => this.renderTableCellHeader(column)
		)

		return (
			<tr className='headings'>
				{cells}
			</tr>
		)
	}

	renderTableCellHeader (data) {
		const { heading, category, classes } = data
		const sortFunction = () => this.setSortList(category)

		return (
			<td className={classes}
				onClick={sortFunction} >
					{heading || category}
			</td>
		)

	}

	renderRows () {
		return this.getData().map( (data, index) => {
			// const cells = this.renderCells(data)
			const props = this.props
			return (
				<TableRow
					key={index}
					data={data}
					columns={props.columns} />
			)
		})
	}
}

PlayerList.propTypes = {
	data: PropTypes.array.isRequired,
	columns: PropTypes.array.isRequired,
	sortingRules: PropTypes.object
}

export default PlayerList;

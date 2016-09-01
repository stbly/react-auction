import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'

import {sortBy, flattenToObject} from '../helpers/arrayUtils';

import TableRow from './TableRow.js'
import TableCell from './TableCell.js'

class Table extends Component {
	constructor(props) {
		super(props)
		this.state = {
			reverseSortDirection: true,
			sortParam: 'adjustedValue',
		}
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.data !== this.props.data) {
			this.rows = null
		}
	}

	getSortParam ( param ) {
		const { columns } = this.props
		const columnIds = columns.map( column => column.category )
		const columnIndex = columnIds.indexOf(param)
		const sortParam = columns[columnIndex].sortParam

		return sortParam ? sortParam(param) : param
	}

	setSortParam (param) {
		const { sortParam, reverseSortDirection } = this.state
		const directionSwitch = (param === sortParam)
		const newDirection = directionSwitch ? !reverseSortDirection : reverseSortDirection

		this.setState({
			sortParam: param,
			reverseSortDirection: newDirection
		});
	}

	getSortedRows (list) {
		const { data } = this.props
		const { sortParam, reverseSortDirection } = this.state
		const param = this.getSortParam(sortParam)

		return sortBy(data, param, reverseSortDirection)
	}

	getRows () {
		const { data } = this.props

		const renderedRows = data.map( (item, index) => {
			const row = this.createRow(item, index)
			return { [item.id]: row }
		})

		return flattenToObject(renderedRows)
	}

	createRow (item, index) {
		const { columns } = this.props

		return <TableRow
			key={index}
			data={item}
			columns={columns} />
	}

	render () {
		var listClass = classNames('player-list');

		return (
			<div className='player-list-container'>
				<table className={listClass}>
					<tbody>
						{this.renderHeaderRow()}
						{this.renderRows()}
					</tbody>
				</table>
			</div>

		)
	}

	renderHeaderRow () {
		const { columns } = this.props
		const cells = columns.map(
			(column, index) => this.renderHeaderCells(column, index)
		)

		return (
			<tr className='headings'>
				{cells}
			</tr>
		)
	}

	renderHeaderCells (column, index) {
		const { heading, category, classes } = column
		const sortFunction = () => this.setSortParam(category)

		return (
			<td key={index} className={classes}
				onClick={sortFunction} >
					{heading || category}
			</td>
		)
	}

	renderRows () {
		if (!this.rows) {
			this.rows = this.getRows()
		}

		const sortedRows = this.getSortedRows().map ( row => this.rows[row.id] )
		return sortedRows
	}
}

Table.propTypes = {
	data: PropTypes.array.isRequired,
	columns: PropTypes.array.isRequired
}

export default Table;

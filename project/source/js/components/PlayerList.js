import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

import classNames from 'classnames'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import {sortBy} from '../helpers/arrayUtils';

import '../../stylesheets/components/player-list.scss'



class PlayerList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			toggleSortDirection: true,
			currentSortOption: 'adjustedValue',
			sortedData: null,
		}
	}

	componentWillReceiveProps (nextProps) {
		const { currentSortOption, toggleSortDirection } = this.state
		const { data } = nextProps

		if (currentSortOption) {
			const sortedData = sortBy(data, currentSortOption, toggleSortDirection)
			this.setState({sortedData})
		}
	}

	sortList (param) {
		const { dataToSort, currentSortOption, toggleSortDirection } = this.state
		const { data } = this.props

		if (param === 'name' || param === 'cost' || param === 'pos') {
			param = [
				{ param: param },
				{ param: 'adjustedValue', direction: -1 }
			];
		}

		if (param === 'isFavorited') {
			param = [
				{ param: 'isFavoritedRank' }
			]
		}

		let sortDirection = toggleSortDirection
		if (param.toString() === currentSortOption.toString()) {
			sortDirection = !toggleSortDirection
		}

		this.setState({
			currentSortOption: param,
			toggleSortDirection: sortDirection,
			sortedData: sortBy(data, param, sortDirection)
		});
	}

	rankData (data) {
		const { currentSortOption, toggleSortDirection } = this.state
		const dataSortedByValue = sortBy(data, 'adjustedValue', 'desc')
		const rankedData = dataSortedByValue.map( (player, index) => {
			return Object.assign({}, player, {
				rank: index + 1
			})
		})

		return sortBy(rankedData, currentSortOption, toggleSortDirection)
	}

	getData () {
		const { data, hideDraftedPlayers } = this.props
		const playerList = this.state.sortedData || data;

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
		const sortFunction = () => this.sortList(value)

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
	columns: PropTypes.array.isRequired
}

export default PlayerList;

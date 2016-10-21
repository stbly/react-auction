import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import * as SettingsUtils from '../helpers/SettingsUtils'
import { primaryPositionFor } from '../helpers/PlayerListUtils'
import { sort, sortByProperty, createSort, sortMultiple, flatten, flattenToObject, valueMatch } from '../helpers/arrayUtils'
import { stringMatch } from '../helpers/stringUtils'

import FilteredTable from '../components/FilteredTable.js'

import {createFilter, filterBy} from '../helpers/filterUtils';
import { cellFactory, nameCellFactory, favoriteCellFactory, valueCellFactory, costCellFactory, createStatCells, positionCellFactory, positionCellValueFactory, createNameMatchFilter, positionSort} from '../helpers/tableUtils'

import '../../stylesheets/components/player-list.scss'

//MAJOR TODO: allow filters to be cumulative, not just one at a time

class PlayerListsContainer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listType: 'batter'
		}
	}

	setListType (type) {
		if (this.state.type === type) return
		this.setState({
			listType: type
		})
	}

	dataWasFiltered (prop) {
		const types = this.getPositionTypes()
		for (let i = 0; i < types.length; i++) {
			const type = types[i]
			const categories = this.getPositionsForType(type)
			const categoryMatch = categories.indexOf(prop) > -1
			if (type === prop || categoryMatch) {
				return this.setListType(type)
			}
		}
	}

	getPositionTypes () {
		const { positionData } = this.props
		return Object.keys(positionData)
	}

	getPositionsForType (type) {
		const { positionData } = this.props
		const { positions } = positionData[type]
		return Object.keys(positions)
	}

	getCategories () {
		const { listType } = this.state
		const { positionData } = this.props
		const { categories } = positionData[listType]
		return categories
	}

	getPlayers () {
		let filteredIds = this.getFilteredPlayerIds();
		return this.createPlayerArrayFromIds( filteredIds );
	}

	playersById () {
		return Array.toObject(this.props.players)
	}

	getFilteredPlayerIds () {
		const { players } = this.props

		const filteredIds = players.filter( player => {
			const playerHasValue = player.value
			return playerHasValue
		})

		return filteredIds
	}

	getColumns () {
		const { changePlayerStat, changePlayerCost, updateActivePlayer, updatePlayerFavorited } = this.props.actions
		const categories = this.getCategories()

		const categoryCells = createStatCells(categories, changePlayerStat)

		return [
			cellFactory('rank'),
			positionCellFactory(),
			positionCellValueFactory(),
			favoriteCellFactory(updatePlayerFavorited),
			nameCellFactory(updateActivePlayer),
			cellFactory('type', {className: 'hidden'}),
			costCellFactory(changePlayerCost),
			valueCellFactory('adjustedValue', 'bid'),
			valueCellFactory('value', 'val'),
			...categoryCells
		]
	}

	getSortingFunctions () {
		const { players } = this.props
		const { direction } = this.state
		const categories = this.getCategories()
		const categoriesSorts = Object.keys(categories)
		const playerObject = this.playersById()

		const positionSort = {
			column: 'pos',
			direction: 'desc',
			sortFunction: (playerIdA, playerIdB) => {
				const posA = primaryPositionFor( playerObject[playerIdA] )
				const posB = primaryPositionFor( playerObject[playerIdB] )
				const valueA = playerObject[playerIdA].adjustedValue
				const valueB = playerObject[playerIdB].adjustedValue
				const descending = direction === 1 ? false : true
				const comparePosition = sort(posA, posB, false, false)
				const compareValue = sort(valueA, valueB, descending)

				return sortMultiple( comparePosition, compareValue )
			}
		}

		const sortCost = {
			column: 'cost',
			direction: 'desc',
			sortFunction: (a,b) => {
				const playerA = playerObject[a]
				const playerB = playerObject[b]
				const costSort = sort(playerA.cost, playerB.cost, false, false)
				const valueSort = sort(playerA.value, playerB.value, direction)

				return sortMultiple( costSort, valueSort)
			}
		}

		const sortNumber = (column) => {
			return {
				column,
				direction: 'asc',
				sortFunction: (a, b) => {
					return sort(Number(a), Number(b), true, false)
				}
			}
		}

		return [ 
			sortCost, 
			'rank', 
			'name', 
			sortNumber('bid'),
			sortNumber('val'),
			...categoriesSorts,
			positionSort
		]
	}

	getFilters () {
		const positionTypes = this.getPositionTypes()
		const { positionData } = this.props

		const positions = positionTypes.map( type => {
			const typeFilter = createNameMatchFilter('type', {label: type})
			const positions = Object.keys(positionData[type].positions)
			const positionFilters = positions.map( positionId => createNameMatchFilter('position', {label: positionId}) )
			return [typeFilter, ...positionFilters]
		})

		var flattenedFilters = flatten(positions)
		return flattenedFilters
	}

	render () {
		const { listType } = this.state
		const { players } = this.props

		const rowClassFunction = (item) => classNames( {'selected': item.cost } )
		const classes = classNames('player-list', listType)
		return (
			<FilteredTable
				data={players}
				className={classes}
				columns={this.getColumns()}
				filters={this.getFilters()}
				searchKey='name'
				sortingFunctions={this.getSortingFunctions()}
				onFilter={this.dataWasFiltered.bind(this)}
				rowClassFunction={rowClassFunction} />
		)
	}
}

PlayerListsContainer.propTypes = {
	players: PropTypes.array.isRequired,
	positionData: PropTypes.object.isRequired,
	teams: PropTypes.array,
	isLoading: PropTypes.bool,
	actions: PropTypes.object
}

export default PlayerListsContainer

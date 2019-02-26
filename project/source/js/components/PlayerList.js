import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import { Table } from 'reactable-cacheable'
import * as SettingsUtils from '../helpers/SettingsUtils'
import * as tableUtils from '../helpers/tableUtils'
import { primaryPositionFor, getCategories } from '../helpers/PlayerListUtils'

import { flatten, flattenToObject, valueMatch } from '../helpers/arrayUtils'
import { sortArrayByCategory } from '../helpers/arrayUtils'

import FilteredTable from '../components/FilteredTable.js'


// import '../../stylesheets/components/player-list.scss'

//MAJOR TODO: allow filters to be cumulative, not just one at a time

class PlayerList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listType: 'batter'
		}

		this.makeActive = this.makeActive.bind(this)
		this.makePlayerNameCell = this.makePlayerNameCell.bind(this)
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
			const categoryMatch = categories.includes(prop)
			if (categoryMatch) {
				this.setState({ filteredPosition: prop })
			} else {
				this.setState({ filteredPosition: null })
			}
			if (type === prop || categoryMatch) {
				return this.setListType(type)
			}
		}

		return this.setListType(null)
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
		const { positionData, showRatios } = this.props
		const { categories } = positionData[listType]

		return getCategories(categories, showRatios)
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

	changePlayerStat (id, stat, value) {
		const { preserveRatios, actions, players, positionData } = this.props
		const { changePlayerStat } = actions
		const { listType } = this.state
		const { categories } = positionData[listType]
		const playersObject = Array.toObject(players)
		const player = playersObject[id]

		changePlayerStat(id,stat,value, preserveRatios)

		// const { isCountingStatRatioModifier, numerator } = categories[stat]
		//
		// if ( isCountingStatRatioModifier ) {
		// 	// if changing player's stat ratio
		// 	const denominatorStat = categories[numerator].denominator
		// 	const newStat = ( value * player.stats[denominatorStat] )
		//
		//
		// } else {
			// if changing counting stat
			// if (preserveRatios) {
			// 	const updatedStats = [stat]
			// 	let updateQueue = [{
			// 		stat,
			// 		value
			// 	}]
			// 	updateQueue.forEach(queue => {
			// 		console.log('updateQueue', queue)
			// 	})
			// 	while (updateQueue.length > 0) {
			// 		const currentStat = updateQueue[0]
			//
			// 		const dependentStats = this.getDependentStatsFor(currentStat.stat)
			// 		console.log(currentStat.stat, dependentStats)
			// 		dependentStats.forEach( dependentStat => {
			// 			if (updatedStats.indexOf(dependentStat) < 0) {
			// 				const dependentStatRatioKey = this.getCorrespondingRatioFor(dependentStat)
			// 				const dependentStatRatio = player.stats[dependentStatRatioKey]
			// 				const newDependentStatValue = currentStat.value * dependentStatRatio
			//
			// 				// const newStat = statCalculations[dependentStat](player.stats, currentStat.value)
			// 				changePlayerStat(id,dependentStat,newDependentStatValue, preserveRatios)
			//
			// 				const moreDependentStats = this.getDependentStatsFor(dependentStat)
			//
			// 				if (moreDependentStats.length > 0) {
			// 					updateQueue.push({
			// 						stat: dependentStat,
			// 						value: newDependentStatValue
			// 					})
			// 				}
			// 			}
			// 		})
			//
			// 		updateQueue.splice(0, 1);
			// 	}
			// }


		// }
	}

	// getDependentStatsFor (stat) {
	// 	const { positionData } = this.props
	// 	const { listType } = this.state
	// 	const { categories } = positionData[listType]
	// 	const categoryKeys = Object.keys(categories)
	//
	// 	return categoryKeys.filter( key => {
	// 		const { denominator, isCountingStat } = categories[key]
	// 		// console.log(stat, categoryKey, denominator)
	// 		return (denominator === stat && isCountingStat)
	// 	})
	// }

	// getCorrespondingRatioFor (stat) {
	// 	const { positionData } = this.props
	// 	const { listType } = this.state
	// 	const { categories } = positionData[listType]
	//
	// 	const ratio = Object.keys(categories).find( key => {
	// 		return categories[key].isCountingStatRatioModifier && categories[key].numerator && categories[key].numerator === stat
	// 	})
	//
	// 	return ratio
	// }

	makeActive = (playerId) => {
		const { updateActivePlayer } = actions
		updateActivePlayer(playerId)
	}

	makePlayerNameCell () {
		const { isAuctionLeague, actions } = this.props
		const { updatePlayerSleeperStatus, updatePlayerFavorited, setPlayerDrafted, changePlayerCost} = actions
		return (
			tableUtils.playerNameCellFactory(isAuctionLeague, {
				handleIsDraftedClick: isAuctionLeague ? changePlayerCost : setPlayerDrafted,
				handleInformationClick: this.makeActive,
				handleSleeperClick: updatePlayerSleeperStatus,
				handleFavoriteClick: updatePlayerFavorited
			})
		)
	}

	getColumns () {
		const { listType, filteredPosition } = this.state
		const { isAuctionLeague, actions } = this.props
		const { changePlayerCost, updateActivePlayer, updatePlayerSleeperStatus, updatePlayerFavorited, setPlayerDrafted, updatePlayerTier } = actions
		const { cellFactory, favoriteCellFactory, valueCellFactory, isDraftedCellFactory } = tableUtils

		let categoryCells = []
		if (listType) {
			categoryCells = tableUtils.createStatCells(this.getCategories(), this.changePlayerStat.bind(this))
		}

		const valueCells = isAuctionLeague ? [
			tableUtils.costCellFactory(changePlayerCost),
			tableUtils.valueCellFactory('adjustedValue', 'bid'),
			tableUtils.valueCellFactory('value', 'val')
		] : []

		const draftedCells = !isAuctionLeague ? [
			tableUtils.isDraftedCellFactory(setPlayerDrafted)
		] : []

		const tierCells = filteredPosition ? [
			tableUtils.tierCellFactory(filteredPosition, updatePlayerTier)
		] : []

		return [
			tableUtils.cellFactory('rank', {className: 'small-cell'}),
			// ...draftedCells,
			...tierCells,
			tableUtils.cellFactory('position', {className: 'small-cell hidden', valueFunction: primaryPositionFor}),
			tableUtils.cellFactory('pos', {className: 'small-cell', valueFunction: player => player.id, elementFunction: player => primaryPositionFor(player) }),
			// tableUtils.favoriteCellFactory(updatePlayerFavorited),
			this.makePlayerNameCell(),
			tableUtils.cellFactory('type', {className: 'hidden'}),
			...valueCells,
			...categoryCells
		]
	}

	getSortingFunctions () {
		const { players, isAuctionLeague } = this.props
		const { listType, direction, filteredPosition } = this.state
		const { sortCost, sortNumber, sortPosition, sortTier } = tableUtils

		let categorySorts = []
		if (listType) {
			categorySorts = Object.keys( this.getCategories() )
		}

		const playerObject = this.playersById()

		const tierSorts = filteredPosition ? [
			sortTier(playerObject, filteredPosition)
		] : []

		const valueSorts = isAuctionLeague ? [
			sortCost(playerObject),
			sortNumber('bid'),
			sortNumber('val')
		] : []


		return [
			'rank',
			'name',
			...tierSorts,
			...valueSorts,
			...categorySorts,
			sortPosition(playerObject)
		]
	}

	getFilters () {
		const positionTypes = this.getPositionTypes()
		const { positionData } = this.props

		const filters = [
			tableUtils.createNameMatchFilter('type', ['batter', 'pitcher'], {heading: 'All Players'})
		]

		const positions = positionTypes.forEach( type => {
			const typeFilter = tableUtils.createNameMatchFilter('type', type)
			const positions = Object.keys(positionData[type].positions)
			const positionFilters = positions.map( positionId => tableUtils.createNameMatchFilter('position', positionId) )
			filters.push(typeFilter, ...positionFilters)
		})

		// var flattenedFilters = flatten(filters)
		return filters
	}

	render () {
		const { listType, filteredPosition } = this.state
		const { players } = this.props
		const rowClassFunction = (item) => classNames( item.type, {'selected': item.cost || item.isDrafted === true } )
		const classes = classNames('player-list')
		return (
			<div>
				<FilteredTable
					data={players}
					className={classes}
					columns={this.getColumns()}
					filters={this.getFilters()}
					searchKey='name'
					sortingFunctions={this.getSortingFunctions()}
					defaultSort={ filteredPosition ? 'tier' : 'rank' }
					onFilter={this.dataWasFiltered.bind(this)}
					rowClassFunction={rowClassFunction} />
				{ this.renderFavoritePlayerList() }
				{ this.renderSleeperList() }
			</div>
		)
	}

	renderFavoritePlayerList () {
		const { listType, filteredPosition } = this.state
		const { players, actions } = this.props
		const favoritedPlayers = players.filter( player => player.isFavorited && !player.isDrafted)

		const { setPlayerDrafted } = actions
		const { cellFactory, favoriteCellFactory, valueCellFactory, isDraftedCellFactory } = tableUtils
		const rowClassFunction = (item) => classNames( item.type, {'selected': item.cost || item.isDrafted } )

		const columns = [
			tableUtils.cellFactory('rank', {className: 'small-cell'}),
			tableUtils.cellFactory('pos', {className: 'small-cell', valueFunction: player => player.id, elementFunction: player => primaryPositionFor(player) }),
			this.makePlayerNameCell()
		]

		const playerObject = this.playersById()
		const { sortPosition } = tableUtils
		const sorts = [
			'rank',
			sortPosition(playerObject),
			'name'
		]

		const headers = tableUtils.createHeaderRow(columns)
		const rows = tableUtils.createRows(favoritedPlayers, columns, rowClassFunction)
		return (
			<div className='favorited-player-list'>
				<h2>Watch List</h2>
				<Table
					sortable={sorts}
					className='player-list' >
					{headers}
					{rows}
				</Table>
			</div>
		)
	}

	renderSleeperList () {
		const { listType, filteredPosition } = this.state
		const { players, actions } = this.props
		const sleepers = players.filter( player => player.isSleeper && !player.isDrafted)

		const { setPlayerDrafted } = actions
		const { cellFactory, favoriteCellFactory, valueCellFactory, isDraftedCellFactory } = tableUtils
		const rowClassFunction = (item) => classNames( item.type, {'selected': item.cost || item.isDrafted } )

		const columns = [
			tableUtils.cellFactory('rank', {className: 'small-cell'}),
			tableUtils.cellFactory('pos', {className: 'small-cell', valueFunction: player => player.id, elementFunction: player => primaryPositionFor(player) }),
			this.makePlayerNameCell()
		]

		const playerObject = this.playersById()
		const { sortPosition } = tableUtils
		const sorts = [
			'rank',
			sortPosition(playerObject),
			'name'
		]

		const headers = tableUtils.createHeaderRow(columns)
		const rows = tableUtils.createRows(sleepers, columns, rowClassFunction)
		return (
			<div className='sleeper-player-list'>
				<h2>Keepers</h2>
				<Table
					sortable={sorts}
					className='player-list' >
					{headers}
					{rows}
				</Table>
			</div>
		)
	}
}

PlayerList.propTypes = {
	players: PropTypes.array.isRequired,
	positionData: PropTypes.object.isRequired,
	teams: PropTypes.array,
	isLoading: PropTypes.bool,
	isAuctionLeague: PropTypes.bool,
	showRatios:PropTypes.bool,
	preserveRatios:PropTypes.bool,
	actions: PropTypes.object
}

export default PlayerList

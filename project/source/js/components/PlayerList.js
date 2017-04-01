import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

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

		const { isCountingStatRatioModifier, numerator } = categories[stat]
		if ( isCountingStatRatioModifier ) {
			const denominatorStat = categories[numerator].denominator
			const newStat = ( value * player.stats[denominatorStat] )
			
			changePlayerStat(id, numerator, newStat)

		} else {
			if (preserveRatios) {
				const updatedStats = [stat]
				let updateQueue = [{
					stat,
					value
				}]

				while (updateQueue.length > 0) {
					const currentStat = updateQueue[0]

					const dependentStats = this.getDependentStatsFor(currentStat.stat)
					dependentStats.forEach( dependentStat => {
						if (updatedStats.indexOf(dependentStat) < 0) {
							const dependentStatRatioKey = this.getCorrespondingRatioFor(dependentStat)
							const dependentStatRatio = player.stats[dependentStatRatioKey]
							const newDependentStatValue = currentStat.value * dependentStatRatio

							changePlayerStat(id,dependentStat,newDependentStatValue)
							
							const moreDependentStats = this.getDependentStatsFor(dependentStat)
							console.log(dependentStat, moreDependentStats)
							if (moreDependentStats.length > 0) {
								updateQueue.push({
									stat: dependentStat,
									value: newDependentStatValue
								})
							}
						}
					})

					updateQueue.splice(0, 1);
				}
			} 

			changePlayerStat(id,stat,value)
		}
	}

	getDependentStatsFor (stat) {
		const { positionData } = this.props
		const { listType } = this.state
		const { categories } = positionData[listType]
		const categoryKeys = Object.keys(categories)

		return categoryKeys.filter( categoryKey => {
			const { denominator, isCountingStat } = categories[categoryKey]
			// console.log(stat, categoryKey, denominator)
			return (denominator === stat && isCountingStat)
		})
	}

	getCorrespondingRatioFor (stat) {
		const { positionData } = this.props
		const { listType } = this.state
		const { categories } = positionData[listType]
		const categoryKeys = Object.keys(categories)

		const ratioStats = categoryKeys.filter( categoryKey => {
			return categories[categoryKey].isCountingStatRatioModifier
		})
		const ratioStatNumerators = ratioStats.map( stat => categories[stat].numerator )

		const indexOfStatWeWant = ratioStatNumerators.indexOf(stat)
		return ratioStats[indexOfStatWeWant]
	}

	getColumns () {
		const { listType, filteredPosition } = this.state
		const { isAuctionLeague, actions } = this.props
		const { changePlayerCost, updateActivePlayer, updatePlayerFavorited, setPlayerDrafted, updatePlayerTier } = actions
		const { cellFactory, favoriteCellFactory, valueCellFactory, isDraftedCellFactory } = tableUtils
		
		let categoryCells = []
		if (listType) {
			categoryCells = tableUtils.createStatCells(this.getCategories(), this.changePlayerStat.bind(this))
		}

		const nameClick = (player) => {
			updateActivePlayer(player.id)
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
			...draftedCells,
			...tierCells,
			tableUtils.cellFactory('position', {className: 'small-cell hidden', valueFunction: primaryPositionFor}),
			tableUtils.cellFactory('pos', {className: 'small-cell', valueFunction: player => player.id, elementFunction: player => primaryPositionFor(player) }),
			tableUtils.favoriteCellFactory(updatePlayerFavorited),
			tableUtils.cellFactory('name', {className: 'large-cell', onClick: nameClick}),
			tableUtils.cellFactory('type', {className: 'hidden'}),
			...valueCells,
			...categoryCells
		]
	}

	getSortingFunctions () {
		const { players, isAuctionLeague } = this.props
		const { listType, direction, filteredPosition } = this.state
		const { sortCost, sortNumber, sortPosition } = tableUtils

		let categorySorts = []
		if (listType) {
			categorySorts = Object.keys( this.getCategories() )
		}

		const tierSorts = filteredPosition ? [
			sortNumber('tier')
		] : []

		const playerObject = this.playersById()

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
		const { listType } = this.state
		const { players } = this.props
		const rowClassFunction = (item) => classNames( item.type, {'selected': item.cost || item.isDrafted } )
		const classes = classNames('player-list')
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

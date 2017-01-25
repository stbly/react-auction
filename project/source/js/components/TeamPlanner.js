import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { newPlayer } from '../helpers/modelUtils'
import { sortArrayByCategory, getDistributions, redistributeValuesToEqual } from '../helpers/arrayUtils'

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

class TeamPlanner extends Component {
	constructor(props) {
		super(props);
		this.playerSlots = {}
	}

	createPlayerSlots (type, players) {
		const { teamSalary, positionData } = this.props
		const { rosterSpots, budgetPercentage } = positionData[type]

		const amountToSpend = Math.round(teamSalary * (budgetPercentage/100))

		let playerSlots
		if (!playerSlots) {
			const slotWeights = getDistributions(amountToSpend, rosterSpots, 3.5, [0, rosterSpots - 1])
			playerSlots = slotWeights.map( slot => {
				return {
					budget: slot
				}
			})
		}

		/*const playersAssignedToSlots = playerSlots.filter(slot => (slot.player)).map( slot => {
			return {
				playerId: slot.player.id,
				slotIndex: playerSlots.indexOf(slot)
			}
		})*/

		// ------------------------------------------------ //
		// ---- make sure player is still on the team ----- //
		// ------------------------------------------------ //
		
		/*const playerIds = (players || []).map( player => player.id )

		playersAssignedToSlots.forEach( slot => {
			if (playerIds.indexOf(slot.playerId) === -1) {
				console.log('remove player at', playerSlots[slot.slotIndex])
				playerSlots[slot.slotIndex].player = null
			}
		})
		*/

		// ------------------------------------------------ //
		// --- end make sure player is still on the team -- //
		// ------------------------------------------------ //


		if (players) {

			// ------------------------------------------------ //
			// --- assign drafted players to existing slots --- //
			// ------------------------------------------------ //


			players.forEach( player => {
				// Find suitable player slot
				const { cost } = player
				// const assignedPlayerIds = playersAssignedToSlots.map( slot => slot.playerId )
				// const assignmentIndex = assignedPlayerIds.indexOf(player.id)

				// if (assignmentIndex > -1) {
				// 	const currentSlotIndex = playersAssignedToSlots[assignmentIndex].slotIndex
				// 	playerSlots[currentSlotIndex].player = player;
				// 	playerSlots[currentSlotIndex].budget = player.cost
				// 	console.log(playerSlots[currentSlotIndex])
				// } else {
				const availableSlots = playerSlots.filter( slot => !slot.player )

				let closestMatchIndex = 0
				let closestDistance = 1000
				for (let i = 0; i < availableSlots.length; i++) {
					const current = availableSlots[i]
					const distance = Math.abs(availableSlots[i].budget - cost)
					if ( distance < closestDistance ) {
						closestMatchIndex = playerSlots.indexOf( availableSlots[i] )
						closestDistance = distance
					}
				}
				console.log(availableSlots, closestDistance, closestMatchIndex)
				playerSlots[closestMatchIndex].player = player
				playerSlots[closestMatchIndex].budget = player.cost
				// console.log(availableSlots)
				// }
			})

			// ------------------------------------------------ //
			// - end assign drafted players to existing slots - //
			// ------------------------------------------------ //


			// ------------------------------------------------ //
			// --- recalculate slot values w/ players added --- //
			// ------------------------------------------------ //

			const slotsToRecalculate = playerSlots.filter( slot => !slot.player )
			const slotsWithPlayers = playerSlots.filter( slot => slot.player )
			const spent = slotsWithPlayers.length > 0 ? 
				slotsWithPlayers.map( slot => slot.player.cost ).reduce( (a,b) => a + b ) :
				null

			const remainingBudget = amountToSpend - spent
			const remainingSlotValues = slotsToRecalculate.map( slot => {
				return slot.budget
			} )
			// console.log(remainingBudget, remainingSlotValues)
			const forcedValues = slotsWithPlayers.map( slot => {
				return {
					value: slot.budget,
					index: playerSlots.indexOf(slot) 
				}
			})
			const recalculatedSlotValues = getDistributions(amountToSpend, rosterSpots, 3.5, [0], forcedValues)

			playerSlots.forEach( (slot, index) => {
				const indexOfSlot = playerSlots.indexOf(slot)
				playerSlots[indexOfSlot].budget = recalculatedSlotValues[index]
			})

			const test = playerSlots.map(slot => slot.budget)
			console.log('slots after players', amountToSpend, test)
			console.log('slots after players sum', test.reduce((a,b) => a+ b))


			// ------------------------------------------------ //
			// - end recalculate slot values w/ players added - //
			// ------------------------------------------------ //

		}

		// console.log(playerSlots)
		
		return playerSlots.map( slot => {
			const player = slot.player || newPlayer()
			// console.log(player)
			return Object.assign({}, player, {
				budget: slot.budget
			})
		})
	}

	render() {
		const { name, players, onChangeTeamName, onResetPlayers } = this.props
		const classes = classNames('team', 'team-' + name)
		
		const playerCosts = players ? players.filter( player => player.cost ) : null
		const renderPlayers = players ? (playerCosts.length === players.length) : true

		return (
			<div className={classes}>
				<div className='team-name'>
					<InputToggle type='string' value={name} valueDidChange={onChangeTeamName} />
				</div>
				<div>
					{ renderPlayers ? this.renderPlayers() : null}
				</div>
				<button onClick={onResetPlayers}>Reset All Players</button>
			</div>
		)
	}

	renderPlayers () {
		const { players, positionData, undraftPlayer} = this.props

		return Object.keys(positionData).map( position => {
			const filteredPlayers = (players || []).filter( player => {
				return player.type === position
			})

			const playerSlots = this.createPlayerSlots(position, filteredPlayers)
			
			const playerObject = Array.toObject(playerSlots)
			const categories = positionData[position].categories
			const categoryCells = createStatCells(categories)
			const columns = [
				valueCellFactory('budget', 'budget', true),
				positionCellFactory(),
				nameCellFactory(),
				cellFactory('type', {className: 'hidden'}),
				costCellFactory(),
				valueCellFactory('adjustedValue', 'bid', true),
				valueCellFactory('value', 'val', true),
				...categoryCells
			]

			const sorts = [ 
				sortNumber('budget'),
				sortCost(playerObject), 
				'rank', 
				'name', 
				sortNumber('bid'),
				sortNumber('val'),
				sortPosition(playerObject),
				...Object.keys(categories)
			]

			const sumRow = this.getSumRow(filteredPlayers, categories);

			const headers = createHeaderRow(columns)

			const rows = createRows(playerSlots, columns, null, { 
				onClick: (player) => { undraftPlayer(player.id) }
			})

			return <Table
				key={position}
				className={classNames('player-list',position)}
				sortable={sorts}
				defaultSort='budget' >
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
				<td colSpan={3}></td>
				{ createCells(sumObject, columns) }
			</tr>
		)
	}

}

TeamPlanner.propTypes = {
	name: PropTypes.string.isRequired,
	players: PropTypes.array,
	positionData: PropTypes.object,
	onChangeTeamName: PropTypes.func,
	onResetPlayers: PropTypes.func
}

export default TeamPlanner
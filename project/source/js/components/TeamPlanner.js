import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { Table, Tfoot } from 'reactable-cacheable'
import classNames from 'classnames';

import { newPlayer } from '../helpers/modelUtils'
import { sortArrayByCategory, getDistributions, redistributeValuesToEqual } from '../helpers/arrayUtils'
import { getStatTotals, getStatTotal } from '../helpers/statUtils'

import Team from './Team'
import InputToggle from './InputToggle'
import ValueSubValueDisplay from './ValueSubValueDisplay'

import '../../stylesheets/components/team.scss'

class TeamPlanner extends Component {
	constructor(props) {
		super(props);

		const {teamPlayers, positionData} = props

		this.state = {
			playerSlots: this.createPlayerSlots(teamPlayers, positionData)
		}
	}

	componentWillReceiveProps(nextProps) {
		const { teamPlayers, positionData } = nextProps

		this.setState({
			playerSlots: this.createPlayerSlots(teamPlayers, positionData)
		})

	}

	createPlayerSlots (players, positionData) {
		const { teamSalary } = this.props

		const slots = {}

		Object.keys(positionData).map( type => {
			const { rosterSpots, budgetPercentage } = positionData[type]
			const amountToSpend = Math.round(teamSalary * (budgetPercentage/100))
			const playersOfType = (players || []).filter( player => player.type === type )

			const slotWeights = getDistributions(amountToSpend, rosterSpots, 3.5, [0, rosterSpots - 1])
			const playerSlots = slotWeights.map( slot => {
				return {
					budget: slot
				}
			})


			// ------------------------------------------------ //
			// --- end make sure player is still on the team -- //
			// ------------------------------------------------ //

			if (playersOfType && playersOfType.length > 0) {

				// ------------------------------------------------ //
				// --- assign drafted players to existing slots --- //
				// ------------------------------------------------ //

				players.forEach( player => {
					// Find suitable player slot
					const { cost } = player

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
					// console.log(availableSlots, closestDistance, closestMatchIndex)
					playerSlots[closestMatchIndex].player = player
					playerSlots[closestMatchIndex].budget = player.cost
					// console.log(availableSlots)

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

				// ------------------------------------------------ //
				// - end recalculate slot values w/ players added - //
				// ------------------------------------------------ //

			}
			
			slots[type] = playerSlots.map( slot => {
				const player = slot.player || newPlayer()
				// console.log(player)
				return Object.assign({}, player, {
					budget: slot.budget
				})
			})

		})

		return slots
	}

	render() {
		const { name, teamPlayers, onChangeTeamName, onResetPlayers, positionData } = this.props
		const classes = classNames('team', 'team-' + name)
		
		const playerCosts = teamPlayers ? teamPlayers.filter( player => player.cost ) : null
		const renderPlayers = teamPlayers ? (playerCosts.length === teamPlayers.length) : true

		return (
			<div className={classes}>
				<div className='team-name'>
					<InputToggle type='string' value={name} valueDidChange={onChangeTeamName} />
				</div>
				<div className='roster' >
					{ this.renderBudgetInfo() }
					{ renderPlayers ? this.renderTeam() : null }
				</div>
				<button onClick={onResetPlayers}>Reset All Players</button>
			</div>
		)
	}

	renderTeam () {
		const { name, teamPlayers, positionData, undraftPlayer, onChangeTeamName, onResetPlayers } = this.props
		const { playerSlots } = this.state

		return Object.keys(playerSlots).map( type => {
			const categories = positionData[type].categories
			const players = playerSlots[type]

			return (
				<div className='roster-container'>
					<Team 
						players={players} 
						type={type}
						positionData={positionData[type]} 
						onChangeTeamName={onChangeTeamName}
						onResetPlayers={onResetPlayers}
						onRowClick={undraftPlayer} />
					
					{ this.renderTrackersForCategories(type) }
					
				</div>
			)
		})
	}

	renderBudgetInfo () {
		const { positionData, budgetData } = this.props
		const { remainingBudget, averageBid } = budgetData

		const budgetDisplaysForEachType = Object.keys(positionData).map( type => {
			const remainingBudgetOfType = budgetData[type].remainingBudget
			const averageBidOfType = budgetData[type].averageBid
			if (!remainingBudgetOfType || !averageBidOfType ) return

			return <ValueSubValueDisplay 
				key={type}
				value={remainingBudgetOfType} 
				className={type}
				heading={'Remaining ' + type + ' Budget'}
				subValue={averageBidOfType.toFixed(2)}
				subValueHeading={'Avg ' + type + ' Bid'}
				valueIsDollarAmount={true} 
				subValueIsDollarAmount={true} />
		})

		return (
			<div className='budget-tracker'>
				
				<ValueSubValueDisplay 
					value={remainingBudget} 
					heading='Remaining Budget' 
					subValue={averageBid.toFixed(2)}
					subValueHeading='Avg Bid'
					valueIsDollarAmount={true} 
					subValueIsDollarAmount={true} />

				{ budgetDisplaysForEachType }
			</div>
		)
	}

	renderTrackersForCategories (type) {
		const { draftablePlayers, positionData } = this.props
		const { playerSlots } = this.state

		const undraftedPlayers = draftablePlayers.filter( player => {
			const drafted = player.owner
			return !drafted  && player.type === type
		})

		if (undraftedPlayers.length === 0) return 

		const { categories, rosterSpots } = positionData[type]
		const goalCategories = Object.keys(categories).filter( key => categories[key].goal )

		const undraftedPlayersOfType = undraftedPlayers.filter( player => {
			const remainingBudgetedSlots = playerSlots[type].filter( slot => !slot.cost )
			const highestBudgetedSlot = Math.max( ...remainingBudgetedSlots.map( slot => slot.budget ))
			const observeHighestBudgetedSlot = remainingBudgetedSlots.length === playerSlots.length

			return player.type === type && player.value >= 1 && (observeHighestBudgetedSlot ? player.value <= highestBudgetedSlot : true)
		})

		// ------------------------------------------------ //
		// ---- project team averages by filling rest ----- //
		// ---- of roster with league average players ----- //
		// ------------------------------------------------ //

		const averagePlayerStatObject = {}
		Object.keys(categories).forEach(categoryKey => {
			const { isRatioStat } = categories[categoryKey]
			const leagueStatTotal = getStatTotal( undraftedPlayersOfType, categories[categoryKey], categoryKey ) 
			const leagueStatAverage = isRatioStat ? leagueStatTotal : (leagueStatTotal / (undraftedPlayersOfType.length))
			Object.assign(averagePlayerStatObject, {
				[categoryKey]: leagueStatAverage
			})
		})

		const playersWithStats = []
		for (var i = 0; i < rosterSpots; i++) {
			const playerAtSlot = playerSlots[type][i]
			const stats = playerAtSlot.cost ? playerAtSlot.stats : averagePlayerStatObject
			const player = Object.assign({}, playerSlots[type][i], { stats })
			playersWithStats.push(player) 
		}

		const projectedTotals = getStatTotals( playersWithStats, categories )

		// ------------------------------------------------ //
		// -- end project team averages by filling rest --- //
		// -- of roster with league average players ------- //
		// ------------------------------------------------ //

		const draftablePlayersOfType = draftablePlayers.filter ( player => player.type === type )

		const categoryTrackers = goalCategories.map( key => {
			const { isRatioStat } = categories[key]
			
			const leagueStatTotal = getStatTotal( draftablePlayersOfType, categories[key], key ) 
			const stat = projectedTotals[key]
			const averageStat = isRatioStat ? stat : (stat / rosterSpots)
			const goal = isRatioStat ? leagueStatTotal : (leagueStatTotal / (draftablePlayersOfType.length))
			const decimalPlaces = isRatioStat ? 3 : 0

			return (
				<div className={classNames('goal', key)}>
					<ValueSubValueDisplay 
						key={key + '_total'}
						value={averageStat.toFixed(decimalPlaces)} 
						heading={key}
						subValue={goal.toFixed(decimalPlaces)}
						subValueHeading='Goal' />
				</div>
			)
		})

		return (
			<div className='goals'>
				<h2>Team Projections</h2>
				{categoryTrackers}
			</div>
		)
	}
}

TeamPlanner.propTypes = {
	name: PropTypes.string.isRequired,
	teamPlayers: PropTypes.array,
	draftablePlayers: PropTypes.array,
	positionData: PropTypes.object,
	onChangeTeamName: PropTypes.func,
	onResetPlayers: PropTypes.func
}

export default TeamPlanner
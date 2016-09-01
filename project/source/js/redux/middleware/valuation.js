import {
	receivePlayers,
	UPDATE_PLAYER_STAT,
	RECEIVE_PLAYERS } from '../modules/players'

import {
	RECEIVE_SETTINGS } from '../modules/settings'

import { filterBy } from '../../helpers/filterUtils';
import { assignPlayerValues } from '../../helpers/PlayerValueUtils'
import { calculateSGPFor} from '../../helpers/PlayerSgpUtils'

const computeAllPlayerValues = (players, state) => {
	const {
		numTeams,
		teamSalary,
		positionData } = state.settings.data

	const playersArray = Object.toArray(players)
	const positionDataTypes = Object.toArray(positionData, 'type')
	const totalMoneyInPool = teamSalary * numTeams;

	const valuedPlayers = positionDataTypes.map( playerType => {
		const { categories, budgetPercentage, rosterSpots, positions, type } = playerType
		const playersOfType = filterBy(playersArray, 'type', type)
		const categoriesArray = Object.toArray(categories)
		const positionsArray = Object.toArray(positions)
		const playersToDraft = rosterSpots * numTeams
		const dollarsToSpend = totalMoneyInPool * (budgetPercentage / 100)
		const playersWithSGPCalculated = calculateSGPFor(playersOfType, categoriesArray, rosterSpots)
		const normalizedPositions = normalizePositions(positionsArray, numTeams)

		return assignPlayerValues(playersWithSGPCalculated, playersToDraft, dollarsToSpend, normalizedPositions)
	})

	const combinedPlayers = Array.concat.apply([],valuedPlayers)
	return Array.toObject(combinedPlayers)
}

const normalizePositions = (positionsArray, numTeams) => {
	return positionsArray.map(
		position => {
			const minimumPerTeam = position.minimum
			const minimum = (minimumPerTeam || 0) * numTeams
			return Object.assign({}, position, { minimum })
		}
	)
}

const valuationMiddlware = ({ dispatch, getState }) => {
	return next => action => {
		const state = getState()
		switch (action.type) {
			case RECEIVE_PLAYERS:
				const players = action.payload.players
				if (players && state.players.didInvalidate) {
					action.payload.players = computeAllPlayerValues(players, state)
				}
				break
			case RECEIVE_SETTINGS:
				const statePlayers = state.players.data
				if (statePlayers && state.settings.didInvalidate) {
					console.log('settings changed, recomputing player values')
					dispatch( receivePlayers( computeAllPlayerValues(statePlayers, state)) )
				}
				break
		}

		return next(action)
	}
}

export default valuationMiddlware
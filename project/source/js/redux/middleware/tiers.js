import {
	receivePlayers,
	RECEIVE_PLAYERS } from '../modules/players'

import { filterBy } from '../../helpers/filterUtils';
import { sortArrayByCategory } from '../../helpers/arrayUtils'

const createPlayerTiers = (players, settings) => {
	const playerTypes = Object.keys(settings.positionData)
	const playersArray = Object.toArray(players)
	const playerIds = playersArray.map( player => player.id )
	const newPlayers = []

	playerTypes.forEach( playerType => {
		const { positions } = settings.positionData[playerType]
		const playersOfType = filterBy(playersArray, 'type', playerType)
		const positionsArray = Object.keys(positions)

		positionsArray.forEach( posId => {
			const position = positions[posId]
			let playersAtPosition = playersOfType.filter( player => player.positions.includes(posId) )
			playersAtPosition = sortArrayByCategory(playersAtPosition, 'adjustedValue', true)

			let currentTier = 1
			let firstPlayerAtTier = playersAtPosition[0]
			const tierValueLimit = 4
			for ( let i = 0; i < playersAtPosition.length; i++) {
				const player = playersAtPosition[i]
				// don't replace an already set tier
				if (player.tiers && player.tiers[posId]) {
					continue
				}

				if ( i !== (playersAtPosition.length - 1)) {
					player.tiers = player.tiers || {}	
					if (firstPlayerAtTier.adjustedValue - player.adjustedValue > tierValueLimit) {
						currentTier++
						firstPlayerAtTier = player
					}
					player.tiers[posId] = player.tiers[posId] || currentTier;
				}
			}
		})
	})

	return Array.toObject(playersArray)
}

const statMiddleware = ({ dispatch, getState }) => {
	return next => action => {
		const state = getState()
		const { teams, settings, players } = state
		const settingsData = settings.data
		const playerData = players.data

		switch (action.type) {
			case RECEIVE_PLAYERS:
				const actionPlayerData = action.payload.players
				if (actionPlayerData && players.didInvalidate) {
					action.payload.players = createPlayerTiers(actionPlayerData, settingsData)
				}
				break
		}

		return next(action)
	}
}

export default statMiddleware
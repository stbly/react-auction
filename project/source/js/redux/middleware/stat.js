import {
	receivePlayers,
	RECEIVE_PLAYERS } from '../modules/players'

import {
	RECEIVE_SETTINGS } from '../modules/settings'

import { filterBy } from '../../helpers/filterUtils';
import { ratioStatCalculators } from '../../helpers/statUtils'

const computeRatioStats = (players, settings) => {
	const playerTypes = Object.keys(settings.positionData)
	const playersArray = Object.toArray(players)
	const newPlayers = []

	playerTypes.forEach( playerType => {
		const { categories } = settings.positionData[playerType]
		const playersOfType = filterBy(playersArray, 'type', playerType)
		const categoriesArray = Object.keys(categories)

		// to do: do away with ratio stat modifiers convention and remove them from default settings.
		// have them be calculated here and only referenced here if possible

		// to do: make all ratio stats like ERA and AVG calculated here instead of projected ERA/WHIP
		// once that's done we can get rid of cumulative stats convention

		// const countingStatRatioModifiers = categoriesArray.filter( category => {
		// 	return categories[category].isCountingStatRatioModifier
		// })

		const ratioStats = categoriesArray.filter( category => {
			return ratioStatCalculators[category] && categories[category].isRatioStat
		})
		//
		// const cumulativeStats = categoriesArray.filter( category => {
		// 	return categories[category].isCumulativeStat
		// })

		playersOfType.forEach( player => {
			const newPlayer = Object.assign({}, player)
			const { stats } = player

			ratioStats.forEach( stat => {
				newPlayer.stats[stat] = ratioStatCalculators[stat](stats)
			})
			//
			// countingStatRatioModifiers.forEach( stat => {
			// 	const category = categories[stat]
			// 	const { numerator } = category
			// 	newPlayer.stats[stat] = stats[numerator] / stats[categories[numerator].denominator]
			// })
			//
			// cumulativeStats.forEach( stat => {
			// 	const category = categories[stat]
			// 	const { dependentStats } = category
			// 	const total = dependentStats.map( id => stats[id] ).reduce( (a, b) => a + b )
			// 	newPlayer.stats[stat] = total
			// })

			newPlayers.push(newPlayer)
		})
	})

	return Array.toObject(newPlayers)
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
					console.log(action.payload.players)
					// --------------------- //
					// this is for computing ratio stats from counting stats;
					// disabling for now since the tool isn't set up yet to infer
					// all ratio stat information from counting stats.
					// --------------------- //

					// action.payload.players = computeRatioStats(actionPlayerData, settingsData)
				}
				break
		}

		return next(action)
	}
}

export default statMiddleware

import {sort, sortArrayByCategory } from '../helpers/arrayUtils'
import {filterByPosition} from '../helpers/filterUtils'

export const getFavoritedPlayers = (players, type=null) => {
	const typeBool = typeToCheck => type ? typeToCheck = type : true
	return players.filter( player => typeBool(player.type) && player.isFavorited && !(player.cost > 0) )
}

export const playerIsDrafted = (player) => {
	return player.owner && player.cost !== 0
}

export const playerIsUndrafted = (player) => {
	return !playerIsDrafted(player)
}

export const rankPlayers = (players, category, descending=true) => {
	const sortedPlayers = sortArrayByCategory(players, category, descending)
	return sortedPlayers.map( (player, index) => {
		player.rank = index + 1
		return player
	})
}

export const primaryPositionFor = (player) => {
	return player.positions ? (player.positions.length > 0 ? player.positions[0] : '') : ''
}

const getScarcePositions = (players, positions) => {
	const scarcePositions = positions.filter( position => {
		const {id, minimum} = position
		const currentPlayersOfType = filterByPosition(players, id)
		return currentPlayersOfType.length < minimum
	})

	const scarcePositionIds = scarcePositions.map( position => position.id )
	const normalPositions = positions.filter( position => {
		return scarcePositionIds.indexOf( position.id ) < 0
	})

	return [scarcePositions, normalPositions]
}

export const getPlayerList = (players, listSize, positions) => {

	const playersSortedBySGP = sortArrayByCategory(players, 'sgp', true)

	let playersAboveReplacement = playersSortedBySGP.slice(0, listSize)
	let playersBelowReplacement = playersSortedBySGP.slice(listSize, 1000)

	const [scarcePositions, normalPositions] = getScarcePositions(playersAboveReplacement, positions)
	const scarcePositionIds = scarcePositions.map( condition => condition.id )
	const normalPositionIds = normalPositions.map( condition => condition.id )

	scarcePositions.forEach( condition => {
		const {id, minimum} = condition
		const currentPlayersOfType = filterByPosition(playersAboveReplacement, id)
		const selectableUnusedPlayers = filterByPosition(playersBelowReplacement, id)
		const difference = minimum - currentPlayersOfType.length
		const playersToAdd = selectableUnusedPlayers.slice(0, difference)
		let playersToRemove = []
		let removeIndex = playersAboveReplacement.length-1

		for (removeIndex; removeIndex >= 0; removeIndex --) {
			const remainingDifference = difference - (listSize - playersAboveReplacement.length)
			if (remainingDifference === 0) break;

			const playerToRemove = playersAboveReplacement[removeIndex];
			const playersPrimaryPosition = primaryPositionFor(playerToRemove)
			const okayToRemove = scarcePositionIds.indexOf(playersPrimaryPosition) < 0;

			if (okayToRemove) {
				const numberOfPlayersOfSamePosition = filterByPosition(playersAboveReplacement, playersPrimaryPosition).length
				const normalPositionIndex = normalPositionIds.indexOf(playersPrimaryPosition)
				const normalPosition = normalPositions[normalPositionIndex]
				if (numberOfPlayersOfSamePosition <= normalPosition.minimum) {
					continue
				} else {
					const index = playersAboveReplacement.indexOf(playerToRemove);
					playersAboveReplacement.splice( index, 1 );
					playersBelowReplacement.push(playerToRemove);

				}
			}
		}

		playersToAdd.forEach( playerToAdd => playersBelowReplacement.splice( playersBelowReplacement.indexOf(playerToAdd), 1 ))
		playersAboveReplacement = playersAboveReplacement.concat(playersToAdd);
	})

	const positionGroups = [...scarcePositionIds, normalPositionIds]

	return [
		rankPlayers(playersAboveReplacement, 'sgp'),
		rankPlayers(playersBelowReplacement, 'sgp'),
		positionGroups
	]
}


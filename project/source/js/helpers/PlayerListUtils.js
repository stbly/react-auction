import {flatten, sort, sortArrayByCategory, sortArrayByCategories } from '../helpers/arrayUtils'

export const getFavoritedPlayers = (players, type=null) => {
	const typeBool = typeToCheck => type ? typeToCheck = type : true
	return players.filter( player => typeBool(player.type) && player.isFavorited && !player.cost )
}

export const playerIsDrafted = (player) => {
	return player.owner && player.cost !== 0
}

export const playerIsUndrafted = (player) => {
	return !playerIsDrafted(player)
}

export const rankPlayers = (players, category, descending=true) => {
	const sortedPlayers = sortArrayByCategory(players, category, descending)
	const aboveReplacement = sortedPlayers.filter( player => player.isAboveReplacement )
	const belowReplacement = sortedPlayers.filter( player => !player.isAboveReplacement )
	let lastIndex = 0
	const ranker = (players) => { 
		return players.map( (player) => {
			lastIndex += 1
			player.rank = lastIndex
			return player
		}) 
	}

	const unforcedOneDollarPlayers = aboveReplacement.filter( player => !player.forcedOneDollar)
	let forcedOneDollarPlayers = aboveReplacement.filter( player => player.forcedOneDollar)
	if (forcedOneDollarPlayers && forcedOneDollarPlayers.length > 0) {
		forcedOneDollarPlayers = sortArrayByCategory(forcedOneDollarPlayers, 'sgp', descending)
	} else {
		forcedOneDollarPlayers = []
	}

	const combinedPlayers = [...unforcedOneDollarPlayers, ...forcedOneDollarPlayers]

	const rankedAboveReplacement = ranker(combinedPlayers)
	const rankedBelowReplacement = ranker(belowReplacement)

	return [...rankedAboveReplacement, ...rankedBelowReplacement]
}

export const getCategories = (categories, showRatios) => {
	const categoryArray = Object.keys(categories)
	categoryArray.sort( (a,b) => (categories[a].order || a) - (categories[b].order || b) )

	const scoringCategories = categoryArray.filter( category => {
		return categories[category].scoringStat
	})

	const parentCategories = [];
	categoryArray.forEach( category => {
		const { denominator } = categories[category]
		if (denominator && parentCategories.indexOf(denominator) < 0) {
			parentCategories.push(denominator)
		}
	})
	parentCategories.sort((a,b) => (categories[a].order || a) - (categories[b].order || b))
	const combinedCategories = [...parentCategories, ...scoringCategories]
	const displayCategories = {}
	combinedCategories.forEach( category => {
		const categoryStat = categories[category]
		const label = categoryStat.isCountingStat && categoryStat.denominator && showRatios ? category + '_Ratio' : category
		displayCategories[label] = categories[label]
	})

	return displayCategories
}

const filterByPosition = (array, pos) => {
	return array.filter(function (obj) {
		return obj.positions.indexOf(pos) > -1
	});
}

export const primaryPositionFor = (player, orderedPositionIds) => {
	if (orderedPositionIds) {
		return orderedPositionIds.filter( id => player.positions.includes(id))[0]
	}
	return player.positions ? (player.positions.length > 0 ? player.positions[0] : '') : ''
}

const seperatePurePositions = (positions) => {
	const purePositions = positions.filter( position => !position.associatedPositions )
	const combinedPositions = positions.filter( position => position.associatedPositions )
	return [purePositions, combinedPositions]
}

const orderPositions = (positions, desc=false) => {
	const positionsCopy = positions.map( position => position )
	return sortArrayByCategory(positionsCopy, 'order', desc)
}

const getPositionGroups = (players, positions, rareIfEqualToMinimum=false) => {
	// technically already ordered when called from getPlayerList, 
	// but ordering just to be safe
	const orderedPositions = orderPositions(positions)
	const positionIds = orderedPositions.map( position => position.id )

	const [purePositions, combinedPositions] = seperatePurePositions(orderedPositions)

	const isScarce = (numberOfPlayers, minimum) => {
		return rareIfEqualToMinimum ? numberOfPlayers <= minimum : numberOfPlayers < minimum
	}

	let playerPool = players
	const scarcePurePositions = purePositions.filter( position => {
		const currentPlayersOfType = filterByPosition(playerPool, position.id)
		
		// exclude all current players of type from next 
		// iteration so players aren't counted twice
		playerPool = playerPool.filter( player => !currentPlayersOfType.includes( player ))

		return isScarce(currentPlayersOfType.length, position.minimum)
	})

	const scarceCombinedPositions = combinedPositions.filter( position => {
		const combinedPlayers = []
		const {id, minimum, associatedPositions} = position
		let combinedMinimum = minimum;

		let combinedPlayerPool = players
		associatedPositions.forEach( position => {
			const playersAtPosition = filterByPosition(combinedPlayerPool, position)
			combinedPlayerPool = combinedPlayerPool.filter( player => !combinedPlayers.includes( player ))
			combinedMinimum += positions[positionIds.indexOf(position)].minimum
			combinedPlayers.push( ...playersAtPosition )
		})

		return isScarce(combinedPlayers.length, combinedMinimum); 
	})

	const scarcePositionIds = [...scarcePurePositions, ...scarceCombinedPositions].map( position => position.id )
	
	const normalPositions = purePositions.filter( position => {
		return scarcePositionIds.indexOf( position.id ) < 0
	})

	const normalCombinedPositions = combinedPositions.filter( position => {
		return scarcePositionIds.indexOf( position.id ) < 0
	})

	return [scarcePurePositions, normalPositions, scarceCombinedPositions, normalCombinedPositions]
}

export const getPlayerList = (players, listSize, positions) => {
	const orderedPositions = orderPositions(positions)
	const positionIds = orderedPositions.map( position => position.id )

	const playersSortedBySGP = sortArrayByCategory(players, 'sgp', true).filter( player => !player.removedFromPlayerPool )

	let playersAboveReplacement = playersSortedBySGP.slice(0, listSize)
	let playersBelowReplacement = playersSortedBySGP.slice(listSize, 1000)

	const [
		scarcePurePositions, normalPurePositions, 
		scarceCombinedPositions, normalCombinedPositions
	] = getPositionGroups(playersAboveReplacement, orderedPositions)

	let scarcePositionsFromCombinedConditions = scarceCombinedPositions.map( condition => condition.associatedPositions)
	if (scarcePositionsFromCombinedConditions.length > 0) {
		scarcePositionsFromCombinedConditions = flatten(scarcePositionsFromCombinedConditions)
	}
	let scarcePositionIds = [...scarcePurePositions.map( condition => condition.id ), ...scarcePositionsFromCombinedConditions]
	const normalPositionIds = normalPurePositions.map( condition => condition.id )

	// -------------------------- //
	// function for swapping above replacement level players with below replacement
	// level players when the minimum number of players at each position hasn't 
	// been satisfied
	// -------------------------- //
	
	const swapPlayers = (playersToSwap ) => {
		let removeIndex = playersAboveReplacement.length-1
		let difference = playersToSwap.length

		for (removeIndex; removeIndex >= 0; removeIndex --) {
			const remainingDifference = difference - (listSize - playersAboveReplacement.length)
			// escapes loop early once we've removed enough players
			if (remainingDifference === 0) break;

			const playerToRemove = playersAboveReplacement[removeIndex];
			const playersPrimaryPosition = primaryPositionFor(playerToRemove, positionIds)

			const okayToRemove = !scarcePositionIds.includes(playersPrimaryPosition);

			if (okayToRemove) {
				const numberOfPlayersOfSamePosition = filterByPosition(playersAboveReplacement, playersPrimaryPosition).length
				const normalPositionIndex = normalPositionIds.indexOf(playersPrimaryPosition)
				const normalPosition = normalPurePositions[normalPositionIndex]
				if (numberOfPlayersOfSamePosition <= normalPosition.minimum) {
					continue
				} else {
					const index = playersAboveReplacement.indexOf(playerToRemove);
					playersAboveReplacement.splice( index, 1 );
					playersBelowReplacement.push(playerToRemove);
				}
			}
		}

		playersToSwap.forEach( playerToAdd => playersBelowReplacement.splice( playersBelowReplacement.indexOf(playerToAdd), 1 ))
		playersAboveReplacement = playersAboveReplacement.concat(playersToSwap);
	}

	// -------------------------- //
	// -------------------------- //
	// -------------------------- //

	scarcePurePositions.forEach( condition => {
		const {id, minimum, associatedPositions} = condition

		const currentPlayersOfType = filterByPosition(playersAboveReplacement, id)
		const selectableUnusedPlayers = filterByPosition(playersBelowReplacement, id)
		const difference = minimum - currentPlayersOfType.length
		const playersToAdd = selectableUnusedPlayers.slice(0, difference)		

		swapPlayers(playersToAdd)
	})	

	scarceCombinedPositions.forEach( condition => {
		const {id, minimum, associatedPositions} = condition

		let currentPlayersOfType = []
		let selectableUnusedPlayers = []
		let difference = 0
		let totalMinimum = minimum

		associatedPositions.forEach( position => {
			scarcePositionIds.splice( scarcePositionIds.indexOf(position.toString()), 1 )
			totalMinimum += positions[positionIds.indexOf(position)].minimum
			currentPlayersOfType.push ( ...filterByPosition(playersAboveReplacement, position) )
			selectableUnusedPlayers.push( ...filterByPosition(playersBelowReplacement, position) )
		})
		difference = totalMinimum - currentPlayersOfType.length
		selectableUnusedPlayers = sortArrayByCategory(selectableUnusedPlayers, 'sgp', true)
		
		const playersToAdd = selectableUnusedPlayers.slice(0, difference)
		swapPlayers(playersToAdd)
	})

	const newScarcePositionData = getPositionGroups(playersAboveReplacement, orderedPositions, true)

	const newPureScarcePositionsIds = newScarcePositionData[0].map(position => position.id)
	const newNormalPositionIds = newScarcePositionData[1].map(position => position.id)
	const newCombinedScarcePositions = newScarcePositionData[2]
	const finalScarcePositionsIds = [...newPureScarcePositionsIds]
	newCombinedScarcePositions.forEach( position => {
		const { associatedPositions } = position
		associatedPositions.forEach( positionId => {
			if (finalScarcePositionsIds.indexOf(positionId) < 0) {
				const normalPositionIndex = newNormalPositionIds.indexOf(positionId)
				const { minimum } = positions[positionIds.indexOf(positionId)]
				if( normalPositionIndex > -1 && minimum && minimum > 0) {
					newNormalPositionIds.splice(normalPositionIndex, 1)
					finalScarcePositionsIds.push(positionId)
				} else if ( normalPositionIndex < 0 ) {
					newNormalPositionIds.push(positionId)
				}
			} 
		})
	})

	playersAboveReplacement.forEach( player => {
		player.isAboveReplacement = true
	})

	const positionGroups = [...finalScarcePositionsIds, newNormalPositionIds]
	return [
		rankPlayers(playersAboveReplacement, 'sgp'),
		rankPlayers(playersBelowReplacement, 'sgp'),
		positionGroups
	]
}


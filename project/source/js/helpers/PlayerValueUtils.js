import {combineValues, sortBy, findLastItemWithCondition} from './arrayUtils';
import {getPlayerList, primaryPositionFor} from './PlayerListUtils';

const getPlayerValue = (playerSgp, minSgp, pricePerSgp) => {
	return ((playerSgp - minSgp) * pricePerSgp) + 1
}

const createSgpObject = (positionsArray, minSgp) => {
	if (positionsArray.constructor !== Array) positionsArray = [positionsArray]
	return {
		positions: positionsArray,
		minSgp
	}
}

const createSgpGroups = (players, positionGroups) => {
	return positionGroups.map( position => {
		const positionMatch = player => position.indexOf( primaryPositionFor(player) ) > -1
		const lastPlayerAtPosition = findLastItemWithCondition(players, positionMatch)

		return createSgpObject(position, lastPlayerAtPosition.sgp)
	})
}

const assignValuesFor = (players, sgpGroups, pricePerSgp, inflationRate) => {
	const playersSortedBySGP = sortBy(players,'sgp').reverse();
	const sgpGroupPositions = sgpGroups.map( group => group.positions )

	return playersSortedBySGP.map(function (player) {
		const playerPosition = primaryPositionFor(player)

		for (let i=0; i < sgpGroupPositions.length; i++) {
			const positions = sgpGroupPositions[i]
			const positionIndex = positions.indexOf(playerPosition)
			const sgpGroup = sgpGroups[i]

			if (positionIndex > -1) {
				const value = getPlayerValue(player.sgp, sgpGroup.minSgp, pricePerSgp)
				const adjustedValue = inflationRate ? value * inflationRate : null

				return Object.assign({}, player, {
					value,
					adjustedValue
				})
			}
		}
	});
}

const getMarginalSgps = (players, sgpGroups) => {
	const sgpGroupMarginalSgps = sgpGroups.map( sgpGroup => {
		const {positions, minSgp} = sgpGroup

		const playersToCalculateFrom = players.filter( player => {
			const playerPosition = primaryPositionFor(player)
			return positions.indexOf( playerPosition ) > -1
		})

		const marginalSgps = playersToCalculateFrom.map( player => player.sgp - minSgp)
		const combinedMarginalSgps = marginalSgps.reduce( combineValues )
		return combinedMarginalSgps
	})

	return sgpGroupMarginalSgps.reduce( combineValues )
}

export const assignPlayerValues = (players, playersToDraft, dollarsToSpend, positions) => {
	const [
		playersAboveReplacement,
		playersBelowReplacement,
		positionGroups] = getPlayerList(players, playersToDraft, positions);

	const sgpGroups = createSgpGroups(playersAboveReplacement, positionGroups);
	const cumulativeSgp = playersAboveReplacement.map( player => player.sgp ).reduce( combineValues )
	const marginalSgp = getMarginalSgps(playersAboveReplacement, sgpGroups)

	const originalCostPerSgp = dollarsToSpend / cumulativeSgp;
	const marginalDollars = dollarsToSpend - playersToDraft;
	const pricePerSgp = marginalDollars / marginalSgp;

	const valuedPlayers = assignValuesFor(playersAboveReplacement, sgpGroups, pricePerSgp);
	const totalPlayerValue = valuedPlayers.map( player => player.value ).reduce( combineValues )

	const playersAlreadyDrafted = valuedPlayers.filter( player => player.cost )
	const draftedPlayerValue = playersAlreadyDrafted.map( player => player.value ).reduce( combineValues, 0 )
	const totalSpentOnPlayers = playersAlreadyDrafted.map( player => player.cost ).reduce( combineValues, 0 )

	const remainingValue = totalPlayerValue - draftedPlayerValue
	const remainingDollars = dollarsToSpend - totalSpentOnPlayers;
	const inflationRate = remainingDollars / remainingValue;

	const playersWithInflationValue = assignValuesFor(valuedPlayers, sgpGroups, pricePerSgp, inflationRate);
	const combinedPlayers = [].concat(playersWithInflationValue, playersBelowReplacement)

	return combinedPlayers;
}

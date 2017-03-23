import {combineValues, sortArrayByCategory, findLastItemWithCondition} from './arrayUtils';
import {getPlayerList, primaryPositionFor, rankPlayers } from './PlayerListUtils';

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
	const lastPlayersAtPositions = positionGroups.map( position => {
		const positionMatch = player => {
			return position.indexOf( primaryPositionFor(player) ) > -1
		}
		return {
			position,
			player: findLastItemWithCondition(players, positionMatch)
		}
	})

	const filteredLastPlayersAtPositions = lastPlayersAtPositions.filter( position => {
		return position.player
	})

	return filteredLastPlayersAtPositions.map( positionObject => {
		const { position, player } = positionObject
		return createSgpObject(position, player.sgp)
	})
}

const assignValuesFor = (players, sgpGroups, pricePerSgp, inflationRate) => {
	const playersSortedBySGP = sortArrayByCategory(players,'sgp', true)

	const sgpGroupPositions = sgpGroups.map( group => group.positions )
	const sgpGroupsSortedByMinSgp = sgpGroups.sort( (a, b) => b.minSgp - a.minSgp)

	return playersSortedBySGP.map( player => {
		const playerPosition = primaryPositionFor(player)
		const sgpGroupMatch = sgpGroups.filter( sgpGroup => {
			for (var i =0; i < sgpGroup.positions.length; i++) {
				return sgpGroup.positions[i] === playerPosition
			}
		})[0]

		// for (let i=0; i < sgpGroupPositions.length; i++) {
			// const { positions } = sgpGroupMatch[0]
			if (sgpGroupMatch) {
				const value = getPlayerValue(player.sgp, sgpGroupMatch.minSgp, pricePerSgp)
				const adjustedValue = inflationRate ? value * inflationRate : null
						
				return Object.assign({}, player, {
					value,
					adjustedValue
				})
			// }
		}

		const defaultSgp = sgpGroupsSortedByMinSgp[0]
		const value = getPlayerValue(player.sgp, defaultSgp.minSgp, pricePerSgp)
		const adjustedValue = inflationRate ? value * inflationRate : null
		return Object.assign({}, player, {
			value,
			adjustedValue
		})

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
	// console.log('----------------')
	// console.log('playersToDraft',playersToDraft)
	// console.log('dollarsToSpend',dollarsToSpend)
	// console.log('cumulativeSgp',cumulativeSgp)
	// console.log('marginalDollars',marginalDollars)
	// console.log('originalCostPerSgp',originalCostPerSgp)
	// console.log('pricePerSgp',pricePerSgp)
	// console.log('----------------')
	const valuedPlayers = assignValuesFor(playersAboveReplacement, sgpGroups, pricePerSgp);

	const totalPlayerValue = valuedPlayers.map( player => player.value ).reduce( combineValues )

	const playersAlreadyDrafted = valuedPlayers.filter( player => player.cost )

	const draftedPlayerValue = playersAlreadyDrafted.map( player => player.value ).reduce( combineValues, 0 )

	const totalSpentOnPlayers = playersAlreadyDrafted.map( player => player.cost ).reduce( combineValues, 0 )


	const remainingValue = totalPlayerValue - draftedPlayerValue
	const remainingDollars = dollarsToSpend - totalSpentOnPlayers;
	const inflationRate = remainingDollars / remainingValue;

	// console.log('----------------')
	// console.log('dollarsToSpend',dollarsToSpend)
	// console.log('totalPlayerValue',totalPlayerValue)
	// console.log('remainingValue',remainingValue)
	// console.log('remainingDollars',remainingDollars)
	// console.log('draftedPlayerValue',draftedPlayerValue)
	// console.log('inflationRate',inflationRate)
	// console.log('----------------')

	const playersWithInflationValue = assignValuesFor(valuedPlayers, sgpGroups, pricePerSgp, inflationRate);

	/* 
	// Make sure money values make sense
	console.log(dollarsToSpend)
	console.log(playersWithInflationValue.map( player => {
		return player.adjustedValue
	}).reduce( (prev, next) => prev+next) )
	*/
	const belowReplacementPlayerValues = assignValuesFor(playersBelowReplacement, sgpGroups, pricePerSgp, inflationRate)
	
	const combinedPlayers = rankPlayers([...playersWithInflationValue, ...belowReplacementPlayerValues],'adjustedValue');

	return combinedPlayers;
}

import {combineValues, sortArrayByCategory, sortArrayByCategories, findLastItemWithCondition} from './arrayUtils';
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
			return position.includes( primaryPositionFor(player) )
		}
		return {
			position,
			player: findLastItemWithCondition(players, positionMatch)
		}
	})

	const positionsWithPlayers = lastPlayersAtPositions.filter( position => position.player )
	const positionsWithoutPlayers = lastPlayersAtPositions.filter( position => !position.player )

	const sgpGroups = positionsWithPlayers.map( positionObject => {
		const { position, player } = positionObject
		return createSgpObject(position, player.sgp)
	})

	const sortedSgpGroups = sortArrayByCategory(sgpGroups,'minSgp', true)

	positionsWithoutPlayers.forEach( posObject => {
		const { position } = posObject
		sgpGroups[0].positions.push(position)
	})

	return sortedSgpGroups
}

const assignValuesFor = (players, sgpGroups, pricePerSgp, inflationRate) => {
	// const playersSortedBySGP = sortArrayByCategory(players,'sgp', true)
	const sgpGroupPositions = sgpGroups.map( group => group.positions )
	const sgpGroupsSortedByMinSgp = sgpGroups.sort( (a, b) => b.minSgp - a.minSgp)

	return players.map( (player, index) => {
		/*if (index >= (players.length - forcedOneDollarPlayers)) {
			return Object.assign({}, player, {
				value: 1,
				adjustedValue: 1,
			})
		}*/

		const playerPosition = primaryPositionFor(player)

		const sgpGroupMatch = sgpGroups.filter( sgpGroup => {
			const { positions } = sgpGroup
			return positions.indexOf(playerPosition) > -1
		})[0]

		// for (let i=0; i < sgpGroupPositions.length; i++) {
			// const { positions } = sgpGroupMatch[0]
		if (!sgpGroupMatch || sgpGroupMatch === undefined) {
			throw(new Error('No Sgp Group Match found'))
		}
		const value = getPlayerValue(player.sgp, sgpGroupMatch.minSgp, pricePerSgp)
		const adjustedValue = inflationRate ? value * inflationRate : value
				
		return Object.assign({}, player, {
			value,
			adjustedValue
		})
			// }

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

export const assignPlayerValues = (players, playersToDraft, dollarsToSpend, positions, oneDollarPlayers=1) => {
	const [
		playersAboveReplacement,
		playersBelowReplacement,
		positionGroups] = getPlayerList(players, playersToDraft, positions);


	let sgpGroups = createSgpGroups(playersAboveReplacement, positionGroups);
	let cumulativeSgp = playersAboveReplacement.map( player => player.sgp ).reduce( combineValues )

	let marginalSgp = getMarginalSgps(playersAboveReplacement, sgpGroups)

	let totalDollars = dollarsToSpend
	// let costPerSgp = totalDollars / cumulativeSgp;
	let marginalDollars = totalDollars - playersToDraft;
	let pricePerSgp = marginalDollars / marginalSgp;

	// console.log('----------------')
	// console.log('playersToDraft',playersToDraft)
	// console.log('totalDollars',totalDollars)
	// console.log('cumulativeSgp',cumulativeSgp)
	// console.log('marginalDollars',marginalDollars)
	// console.log('pricePerSgp',pricePerSgp)
	// console.log('----------------')

	let valuedPlayers = assignValuesFor(playersAboveReplacement, sgpGroups, pricePerSgp);
	let totalPlayerValue = valuedPlayers.map( player => player.value ).reduce( combineValues )

	if (oneDollarPlayers > 1) {
		const valuedPlayersCopy = valuedPlayers.map(player => player)
		const sortedValuedPlayers = sortArrayByCategory(valuedPlayersCopy, 'value', true)

		const numberOfForcedOneDollarPlayers = oneDollarPlayers - positionGroups.length
		const unforcedOneDollarsPlayers = sortedValuedPlayers.slice(0, sortedValuedPlayers.length - numberOfForcedOneDollarPlayers)
		const forcedOneDollarsPlayers = sortedValuedPlayers.slice(sortedValuedPlayers.length - numberOfForcedOneDollarPlayers, sortedValuedPlayers.length)
		
		sgpGroups = createSgpGroups(unforcedOneDollarsPlayers, positionGroups);
		cumulativeSgp = unforcedOneDollarsPlayers.map( player => player.sgp ).reduce( combineValues )
		marginalSgp = getMarginalSgps(unforcedOneDollarsPlayers, sgpGroups)

		totalDollars = totalDollars - numberOfForcedOneDollarPlayers
		// costPerSgp = totalDollars / cumulativeSgp;
		marginalDollars = totalDollars - unforcedOneDollarsPlayers.length;
		pricePerSgp = marginalDollars / marginalSgp;

		valuedPlayers = assignValuesFor(unforcedOneDollarsPlayers, sgpGroups, pricePerSgp);
		valuedPlayers.push(...forcedOneDollarsPlayers.map( player => Object.assign(player, {value: 1, adjustedValue: 1, forcedOneDollar: true})))

		const totalPlayerValue = valuedPlayers.map( player => player.value ).reduce( combineValues )
	}

	///
	
	// console.log('----------------')
	// console.log('totalDollars',totalDollars)
	// console.log('totalPlayerValue',totalPlayerValue)
	// console.log('remainingValue',remainingValue)
	// console.log('remainingDollars',remainingDollars)
	// console.log('draftedPlayerValue',draftedPlayerValue)
	// console.log('inflationRate',inflationRate)
	// console.log('----------------')

	const playersAlreadyDrafted = valuedPlayers.filter( player => (player.cost || player.cost === 0) )

	const draftedPlayerValue = playersAlreadyDrafted.map( player => player.value ).reduce( combineValues, 0 )
	const totalSpentOnPlayers = playersAlreadyDrafted.map( player => player.cost ).reduce( combineValues, 0 )

	const unforcedOneDollarsPlayers = valuedPlayers.filter( player => !player.forcedOneDollar )
	const draftedForcedOneDollarPlayers = playersAlreadyDrafted.filter( player => player.forcedOneDollar )
	const undraftedForcedOneDollarPlayers = valuedPlayers.filter( player => !player.cost && player.forcedOneDollar)

	const remainingValue = totalPlayerValue - draftedPlayerValue
	const remainingDollars = totalDollars - totalSpentOnPlayers + undraftedForcedOneDollarPlayers.length

	const inflationRate = remainingDollars / remainingValue;

	valuedPlayers = assignValuesFor(unforcedOneDollarsPlayers, sgpGroups, pricePerSgp, inflationRate);
	valuedPlayers.push(...undraftedForcedOneDollarPlayers, ...draftedForcedOneDollarPlayers)


	const newPlayerValue = valuedPlayers.map( player => player.value ).reduce( combineValues, 0 )

	/* 
	// Make sure money values make sense
	console.log(dollarsToSpend)
	console.log(playersWithInflationValue.map( player => {
		return player.adjustedValue
	}).reduce( (prev, next) => prev+next) )
	*/
	const belowReplacementPlayerValues = assignValuesFor(playersBelowReplacement, sgpGroups, pricePerSgp/*, inflationRate*/)
		// console.log('below replacement Players: ', belowReplacementPlayerValues)

	const combinedPlayers = rankPlayers([...valuedPlayers, ...belowReplacementPlayerValues],'adjustedValue');

	return combinedPlayers;
}

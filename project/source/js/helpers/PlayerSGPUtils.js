//TODO: refactor further

import {combineValues} from './arrayUtils'
import {deduceStatFromRatio} from './statUtils'

const createRatioStatSGPCalculator = (averageStat, baseStat, baseDenominator, lowIsHigh = false, perPeriod = 1) => {
	const posNeg = lowIsHigh ? 1 : -1
	return (playerStat, playerDenominator) => {
		const averageTeamStats = averageStat * posNeg
		const statsPlayerAdds = (playerStat + baseStat) * posNeg
		const denominatorPlayerAdds = perPeriod / (playerDenominator + baseDenominator)

		return averageTeamStats - (statsPlayerAdds * denominatorPlayerAdds)
	}
}

const getBaseStats = (stat, averageDenominator, baseToAverageRatio, perPeriod=1) => {
	const averageStat = stat * (averageDenominator / perPeriod)
	const baseStat = baseToAverageRatio * averageStat
	const baseDenominator = baseToAverageRatio * averageDenominator
	return [baseStat, baseDenominator]
}


// TODO: error catching
const createRatioStatCalculation = (statCalculationFunction, id, denominator, perPeriod=1) => {
	return (stats) => {
		const numeratorStat = stats[id]
		const denominatorStat = stats[denominator]
		const playerStat = deduceStatFromRatio(numeratorStat, denominatorStat, perPeriod);
		return statCalculationFunction(playerStat, denominatorStat)
	}
}

export const createSgpCalculationsForRatioStats = (ratioCategories, rosterSpots) => {
	const baseToAverageRatio = ((rosterSpots - 1) / rosterSpots)

	let ratioCalculationFunctions = {}
	for (let i = 0; i < ratioCategories.length; i++) {
		const category = ratioCategories[i]
		const {id, average, lowIsHigh, perPeriod, denominator, denominatorAverage} = category

		const averageDenominators = denominatorAverage * rosterSpots
		const baseStats = getBaseStats(average, averageDenominators, baseToAverageRatio, perPeriod)
		const statCalculation = createRatioStatSGPCalculator(average, ...baseStats, lowIsHigh, perPeriod)
		const ratioCalculationFunction = createRatioStatCalculation(statCalculation, id, denominator, perPeriod)

		ratioCalculationFunctions[id] = ratioCalculationFunction
	}

	return ratioCalculationFunctions
}

const getSgpRatioCalculations = (categories, rosterSpots) => {
	const categoryNames = categories.map( category => category.id )
	const ratioCategories = categories.filter( category => {
		const { isRatioStat, scoringStat, isCumulativeStat } = category
		return isRatioStat && scoringStat && !isCumulativeStat
	})

	const normalizedRatioCategories = ratioCategories.map( category => {
		const {id, average, denominator, lowIsHigh, perPeriod} = category
		const denominatorIndex = categoryNames.indexOf(denominator)
		const denominatorAverage = categories[denominatorIndex].average
		return {id, average, denominator, denominatorAverage, lowIsHigh, perPeriod}
	})

	return createSgpCalculationsForRatioStats(normalizedRatioCategories, rosterSpots)
}

export const calculateSGPFor = (players, categories, rosterSpots) => {
	const playersWithStats = players.filter( player => player.stats)

	//------------------------------------------------------------------------------//
	// Ratio category values have to be calculated seperately from counting stats, so we have to create
	// the ratio calculation functions first before getting each player's SGP
	//------------------------------------------------------------------------------//
	const sgpRatioCalculations = getSgpRatioCalculations(categories, rosterSpots)
	//------------------------------------------------------------------------------//

	const categoriesWithSgps = categories.filter( category => category.sgpd && category.scoringStat )
	return playersWithStats.map( player => {

		// const isReliever = player.position.indexOf('RP') > -1
		// const isCloser = player.position.indexOf('CP') > -1
		// const relieverException = isReliever || isCloser

		const sgp = categoriesWithSgps.map( category => {
			const {id, sgpd} = category
			const {stats} = player
			const defaultCalculationFunction = (stats) => {
				return stats[id]
			}
			const sgpCalculationFunction = sgpRatioCalculations[id] || defaultCalculationFunction
			return sgpCalculationFunction(stats) / sgpd
		}).reduce( combineValues )
		return Object.assign({}, player, {
			sgp
		})
	})
}

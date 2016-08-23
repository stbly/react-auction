//TODO: refactor sgpFunctions objects

import {combineValues} from './arrayUtils'

const createRatioStatSGPCalculator = (averageStat, baseStat, baseDenominator, lowIsHigh = false, perInning = 1) => {
	const posNeg = lowIsHigh ? 1 : -1
	return (playerStat, playerDenominator) => {
		const averageTeamStats = averageStat * posNeg
		const statsPlayerAdds = (playerStat + baseStat) * posNeg
		const denominatorPlayerAdds = perInning / (playerDenominator + baseDenominator)
		return averageTeamStats - (statsPlayerAdds * denominatorPlayerAdds)
	}
}

const createAvgSGPCalculator = (playerSpotRatio, averageAtBats) => {
	const leagueBattingAverage = 0.268 //TODO: create setting for this
	const averageHits = leagueBattingAverage * averageAtBats
	const baseHits = playerSpotRatio * averageHits
	const baseAtBats = playerSpotRatio * averageAtBats
	return createRatioStatSGPCalculator(leagueBattingAverage, baseHits, baseAtBats)
}

const createObpSGPCalculator = (playerSpotRatio, averagePlateAppearances) => {
	const leagueOnBasePercentage = 0.334 //TODO: create setting for this
	const averageOnBaseRate = leagueOnBasePercentage * averagePlateAppearances
	const baseOnBaseRate = playerSpotRatio * averageOnBaseRate
	const basePlateAppearances = playerSpotRatio * averagePlateAppearances
	return createRatioStatSGPCalculator(leagueOnBasePercentage, baseOnBaseRate, basePlateAppearances)
}

const createSlgSGPCalculator = (playerSpotRatio, averageAtBats) => {
	const leagueSluggingPercentage = 0.436 //TODO: create setting for this
	const averageTotalBases = leagueSluggingPercentage * averageAtBats
	const baseTotalBases = playerSpotRatio * averageTotalBases
	const baseAtBats = playerSpotRatio * averageAtBats
	return createRatioStatSGPCalculator(leagueSluggingPercentage, baseTotalBases, baseAtBats)
}

const createEraSGPCalculator = (playerSpotRatio, averageInningsPitched) => {
	const leagueAverageERA = 3.724 //TODO: create setting for this
	const baseInningsPitched = playerSpotRatio * averageInningsPitched
	const averageRunsPerNine = (averageInningsPitched / 9) * leagueAverageERA
	const baseRuns = playerSpotRatio * averageRunsPerNine
	return createRatioStatSGPCalculator(leagueAverageERA, baseRuns, baseInningsPitched, true, 9)
}

const createWhipSGPCalculator = (playerSpotRatio, averageInningsPitched) => {
	const leagueAverageWHIP = 1.234 //TODO: create setting for this
	const baseInningsPitched = playerSpotRatio * averageInningsPitched
	const averageWalksHitsAllowed = averageInningsPitched * leagueAverageWHIP
	const baseWalksHits = playerSpotRatio * averageWalksHitsAllowed
	return createRatioStatSGPCalculator(leagueAverageWHIP, baseWalksHits, baseInningsPitched, true)
}

const returnStatFromCalculationFunction = (calculationFunction, stats) => {
	const {params, prepareParams, calculate} = calculationFunction
	let paramsToEvaluate = []
	if (params) {
		const statParams = params.map( param => stats[param] )
		paramsToEvaluate = prepareParams ? prepareParams(...statParams) : statParams
	}
	return calculate(...paramsToEvaluate)
}

export const createSgpCalculationFunctionsFor = (type, rosterSpots) => {
	const playerSpotRatio = ((rosterSpots - 1) / rosterSpots)

	switch (type) {
		case 'pitcher':
			const averageInningsPitched = 160 * rosterSpots //TODO: make 160 value a setting
			return {
				ERA: {
					params: ['IP', 'ERA'],
					prepareParams: (IP, ERA) => {
						return [((IP * ERA) / 9), IP]
					},
					calculate: createEraSGPCalculator(playerSpotRatio, averageInningsPitched)
				},
				WHIP: {
					params: ['IP', 'WHIP'],
					prepareParams: (IP, WHIP) => {
						return [(IP * WHIP), IP]
					},
					calculate: createWhipSGPCalculator(playerSpotRatio, averageInningsPitched)
				}
			}
		case 'batter':
			const averageAtBats = 475 * rosterSpots //TODO: make 475 value a setting
			const averagePlateAppearances = 540 * rosterSpots //TODO: make 475 value a setting
			const calcObp = createObpSGPCalculator(playerSpotRatio, averagePlateAppearances)
			const calcSlg = createSlgSGPCalculator(playerSpotRatio, averageAtBats)
			return {
				AVG: {
					params: ['AVG', 'AB'],
					prepareParams: (AVG, AB) => {
						return [(AVG * AB), AB]
					},
					calculate: createAvgSGPCalculator(playerSpotRatio, averageAtBats)
				},
				OBP: {
					params: ['OBP', 'PA'],
					prepareParams: (OBP, PA) => {
						return [(OBP * PA), PA]
					},
					calculate: calcObp
				},
				SLG: {
					params: ['SLG', 'AB'],
					prepareParams: (SLG, AB) => {
						return [(SLG * AB), AB]
					},
					calculate: calcSlg
				},
				OPS: {
					params: ['SLG', 'OBP', 'AB', 'PA'],
					prepareParams: (SLG, AB) => {
						return [(SLG * AB), AB, (OBP * PA), PA]
					},
					calculate: (SLG, OBP, AB, PA) => {
						return calcSlg(SLG, AB) + calcObp(OBP, PA)
					}
				}
			}
	}
}

export const calculateSGPFor = (players, categories, sgpCalculationFunctions=[]) => {
	const playersWithStats = players.filter( player => player.stats)
	return playersWithStats.map( player => {
		return Object.assign({}, player, {
			sgp: categories.map( category => {
				const {id, sgpd} = category
				const {stats} = player
				const calculationFunction = sgpCalculationFunctions[id]

				let stat = stats[id]
				if (calculationFunction) {
					stat = returnStatFromCalculationFunction(calculationFunction, stats)
				}

				return stat / sgpd
			}).reduce( combineValues )
		})
	})
}

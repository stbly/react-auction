import { G, Gp, GS, AB, PA, H, SINGLES, DOUBLES, TRIPLES, HR, RBI, BBb, SOb, SB, CS, HBP, SF, AVG, OBP, SLG, OPS, R, IP, W, ER, Hp, Rp, SV, HD, SO,BB, ERA, WHIP, QS } from './constants/stats'

export const deduceStatFromRatio = (numerator, denominator, perPeriod=1) => {
	return ((numerator * denominator) / perPeriod);
}

export const addAllNormalStatValuesOfTypeForPlayers = (players, statId) => {
	var statValues =
		players.length > 0 ?
			players.map( player => player.stats[statId]).reduce( (a, b) => a + b )
			: 0
	return statValues;
}

export const addAllRatioStatValuesOfTypeForPlayers = (players, statId, denominatorStat, perPeriod=1) => {
	var statValues = players.map( player => {
		return deduceStatFromRatio(player.stats[statId], player.stats[denominatorStat], perPeriod);
	});
	var combinedStatValues = players.length > 0 ? statValues.reduce( (a, b) => a + b ) : 0;
	var combinedDenominatorValues =
		players.length > 0 ?
			players.map( player => player.stats[denominatorStat] ).reduce( (a, b) => a + b )
			: 1
	return (combinedStatValues / combinedDenominatorValues) * perPeriod;
}

export const getStatTotal = (players, category, categoryKey) => {
	const { isRatioStat, denominator, perPeriod } = category;
	const statCalculation = isRatioStat ? addAllRatioStatValuesOfTypeForPlayers : addAllNormalStatValuesOfTypeForPlayers;

	let params = [players, categoryKey];
	if (isRatioStat) {
		params.push(denominator, perPeriod);
	}

	return statCalculation(...params);
}

export const getStatTotals = (players, categories) => {
	const statObject = {}
	Object.keys(categories).forEach( categoryKey => {
		const category = categories[categoryKey]
		const statTotal = getStatTotal(players, category, categoryKey)
		statObject[categoryKey] = statTotal
		// console.log(statCalculation(...params))
	})

	return statObject
}

const sluggingCalculator = (stats) => {
	const singles = stats[SINGLES] ? stats[SINGLES] : stats[H] - (stats[DOUBLES] + stats[TRIPLES] + stats[HR])
	const doubles = stats[DOUBLES] * 2
	const triples = stats[TRIPLES] * 3
	const homers = stats[HR] * 4
	const total_bases = singles + doubles + triples + homers
	return total_bases / stats[AB]
}

const obpCalculator = (stats) => {
	return (stats[H] + stats[BBb] + stats[HBP]) / (stats[AB] + stats[BBb] + stats[HBP] + (stats[SF] || 0));
}

export const ratioStatCalculators = {
	[AVG]: (stats) => {
		return stats[H] / stats[AB];
	},
	[OBP]: obpCalculator,
	[SLG]: sluggingCalculator,
	[OPS]: (stats) => {
		return obpCalculator(stats) + sluggingCalculator(stats)
	},
	[ERA]: (stats) => {
		return 9 * (stats[ER] / stats[IP])
	},
	[WHIP]: (stats) => {
		return (stats[BB] + stats[Hp]) / stats[IP]
	},
}

const createStatValue = (stat, value) => {
	return {stat, value}
}

const statChangers = {
	[PA]: (value, stats) => {
		const statsToChange = [G, AB, H, DOUBLES, TRIPLES, HR, RBI, BBb, SOb, SB, CS, HBP, R].filter( stat => stats[stat] )
		const existingPas = stats[PA]
		const statChanges = statsToChange.map( stat => {
			let statValue = stats[stat];
			statValue = (value * ((statValue / existingPas)))
			return createStatValue(stat, statValue)
		})
		return [createStatValue(PA, value), ...statChanges]
	},
	[AB]: (value, stats) => {
		const statsToChange = [G, PA, H, DOUBLES, TRIPLES, HR, RBI, BBb, SOb, SB, CS, HBP, R].filter( stat => stats[stat] )
		const existingAbs = stats[AB]
		const statChanges = statsToChange.map( stat => {
			let statValue = stats[stat];
			statValue = (value * ((statValue / existingAbs)))
			return createStatValue(stat, statValue)
		})
		return [createStatValue(AB, value), ...statChanges]
	},
	[IP]: (value, stats, includeGps=true) => {
		const statsToChange = [W, ER, Hp, Rp, SV, HD, SO, BB, QS].filter( stat => stats[stat] )
		if (includeGps) {
			statsToChange.push(Gp)
			statsToChange.push(GS)
		}
		const existingIPs = stats[IP]
		const statChanges = statsToChange.map( stat => {
			let statValue = stats[stat];
			statValue = (value * ((statValue / existingIPs)))
			return createStatValue(stat, statValue)
		})
		return [createStatValue(IP, value), ...statChanges]
	},
	[Gp]: (value, stats) => {
		const existingGPs = stats[Gp]
		const newIPs = (stats[IP] / existingGPs) * value
		const newGSs = (stats[GS] / existingGPs) * value
		const statChanges = statChangers[IP](newIPs, stats, false)

		return [createStatValue(Gp, value), createStatValue(GS, newGSs), ...statChanges]
	},
	[GS]: (value, stats) => {
		const existingGSs = stats[GS]
		const newIPs = (stats[IP] / existingGSs) * value
		const newGps = (stats[Gp] / existingGSs) * value
		const statChanges = statChangers[IP](newIPs, stats, false)

		return [createStatValue(GS, value), createStatValue(Gp, newGps), ...statChanges]
	},
	// [HR]: (value, stats) => {
	// 	const statsToChange = [H, R, RBI]
	// 	const newHomeRuns= (value - stats[HR])
	// 	const newHits = stats[H] + newHomeRuns
	// 	const newRuns = stats[R] + newHomeRuns
	// 	const rbiRatio = (0.33 * (stats[RBI] - stats[HR])) / stats[HR]
	// 	const newRbis = stats[RBI] + (newHomeRuns + (newHomeRuns * rbiRatio))
	//
	// 	return [
	// 		createStatValue(H, newHits),
	// 		createStatValue(R, newRuns),
	// 		createStatValue(HR, value),
	// 		createStatValue(RBI, newRbis),
	// 	]
	// }
}

const defaultStatUpdater = (stat) => {
	return (value) => [createStatValue(stat, value)]
}

export const getStatUpdaterFor = (stat, preserveRatios=true) => {
	let statUpdater = defaultStatUpdater(stat)

	if (statChangers[stat] && preserveRatios) {
		statUpdater = statChangers[stat]
	}

	return statUpdater
}

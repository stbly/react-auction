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
		statObject[categoryKey] = getStatTotal(players, category, categoryKey)
		// console.log(statCalculation(...params))
	})	

	return statObject
}

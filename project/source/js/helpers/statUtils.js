export const deduceStatFromRatio = (numerator, denominator, perPeriod=1) => {
	return ((numerator * denominator) / perPeriod);
}

export const addAllNormalStatValuesOfTypeForPlayers = (players, statId) => {
	var statValues = players.map( player => player.stats[statId])
	return statValues.reduce( (a, b) => a + b );
}

export const addAllRatioStatValuesOfTypeForPlayers = (players, statId, denominatorStat, perPeriod=1) => {
	var statValues = players.map( player => {
		return deduceStatFromRatio(player.stats[statId], player.stats[denominatorStat], perPeriod);
	});
	var combinedStatValues = statValues.reduce( (a, b) => a + b );
	var combinedDenominatorValues = players.map( player => player.stats[denominatorStat] ).reduce( (a, b) => a + b );
	return (combinedStatValues / combinedDenominatorValues) * perPeriod;
}

export default function calculateSGPFor (players, categories, rosterSpots, type) {
	// console.log('calculating SGP');
	var sgpCalculation = type === 'batter' ? getBatterSGP : getPitcherSGP

	return players.map(function (player){
		player.sgp = sgpCalculation(player, categories, rosterSpots);
		return player;
	});
}

function getBatterSGP (player, categories, rosterSpots) {
		var totalSgp = 0,
			leagueBattingAverage = .268,
			leagueOnBasePercentage = .334,
			leagueSluggingPercentage = .436,
			averageAtBats = 475 * rosterSpots,
			averagePlateAppearances = 540 * rosterSpots,
			playerSpotRatio = ((rosterSpots - 1) / rosterSpots);

		var categorySGPs = categories.filter(function (category) {
			return category.sgpd;
		});

		categorySGPs.forEach(function (category) {
			var sgp = 0,
				sgpd = category.sgpd,
				categoryStat = category.abbreviation,
				ratioStat = (categoryStat === 'AVG' || categoryStat === 'SLG' || categoryStat === 'OBP' || categoryStat === 'OPS');

			if (ratioStat) {

				var playerAtBats = player.stats.AB,
					playerPlateApperances = player.stats.PA,
					playerStat = player.stats[categoryStat];

				var averageHits = leagueBattingAverage * averageAtBats;
				var averageOnBaseRate = leagueOnBasePercentage * averagePlateAppearances;
				var averageTotalBases = leagueSluggingPercentage * averageAtBats;
				var baseAtBats = playerSpotRatio * averageAtBats;
				var basePlateAppearances = playerSpotRatio * averagePlateAppearances;
				var baseHits = playerSpotRatio * averageHits;
				var baseOnBaseRate = playerSpotRatio * averageOnBaseRate;
				var baseTotalBases = playerSpotRatio * averageTotalBases;

				var plateStat = (categoryStat === 'OBP') ? playerPlateApperances : playerAtBats;
				var basePlateStat = (categoryStat === 'OBP') ? basePlateAppearances : baseAtBats;
				var baseStat = (categoryStat === 'OBP') ? baseOnBaseRate : (categoryStat === 'SLG') ? baseTotalBases : baseHits;
				var leagueAverageStat = (categoryStat === 'OBP') ? leagueOnBasePercentage : (categoryStat === 'SLG') ? leagueSluggingPercentage : leagueBattingAverage;

				if (categoryStat === 'OPS') {
					var obpSgp = (((baseOnBaseRate + (playerPlateApperances * player.stats.OBP)) / (basePlateAppearances + playerPlateApperances)) - leagueOnBasePercentage);
					var slgSgp = (((baseTotalBases + (playerAtBats * player.stats.SLG)) / (baseAtBats + playerAtBats)) - leagueSluggingPercentage);

					sgp = (obpSgp + slgSgp) / sgpd;
				} else {
					sgp = ((((baseStat + (plateStat * playerStat)) / (basePlateStat + plateStat)) - leagueAverageStat) / sgpd);
				}

			} else {
				sgp = player.stats[categoryStat] / sgpd;
			}

			totalSgp += sgp;

		});
		return totalSgp;
	}

function getPitcherSGP (player, categories, rosterSpots) {
		var totalSgp = 0,
			leagueAverageERA = 3.724,
			leagueAverageWHIP = 1.234,
			averageInningsPitched = 160 * rosterSpots,
			playerSpotRatio = ((rosterSpots - 1) / rosterSpots);

		var categorySGPs = categories.filter(function (category) {
			return category.sgpd;
		});

		categorySGPs.forEach(function (category) {
			var sgp = 0,
				sgpd = category.sgpd,
				categoryStat = category.abbreviation.toString(),
				ratioStat = (categoryStat === 'ERA' || categoryStat === 'WHIP');

			if (ratioStat) {

				var playerInningsPitched = player.stats.IP,
					playerEarnedRuns = (playerInningsPitched * player.stats.ERA) / 9,
					playerWalksHits = (playerInningsPitched * player.stats.WHIP),
					playerStat = player.stats[categoryStat];

				var averageRunsPerNine = (averageInningsPitched / 9) * leagueAverageERA;
				var averageWalksHitsAllowed = averageInningsPitched * leagueAverageWHIP;

				var baseInningsPitched = playerSpotRatio * averageInningsPitched;
				var baseRuns = playerSpotRatio * averageRunsPerNine;
				var baseWalksHits = playerSpotRatio * averageWalksHitsAllowed;

				var leagueAverageStat = (categoryStat === 'WHIP') ? leagueAverageWHIP : leagueAverageERA;

				if (categoryStat === 'ERA') {
					sgp = ((leagueAverageStat - ((baseRuns + playerEarnedRuns) * (9 / (playerInningsPitched + baseInningsPitched)))) / sgpd);
				} else {
					sgp = ((leagueAverageStat - ((baseWalksHits + playerWalksHits) / (playerInningsPitched + baseInningsPitched))) / sgpd)
				}

			} else {
				sgp = player.stats[categoryStat] / sgpd;
			}
			totalSgp += sgp;
		});

		return totalSgp;
	}
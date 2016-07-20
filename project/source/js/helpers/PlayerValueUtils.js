import {sortBy} from './sortUtils';
import {primaryPositionFor, rankPlayers} from './PlayerListUtils';

function determineSgpGroups (players, scarcePositions) {
	// console.log(players);
	var sgpGroups = [];
	scarcePositions.forEach(function (position){
		/* --- Determine the minimum SGPs for each rare position --- */
		// console.log(players);
		var positionIndex = players.length-1,
			positionType = position.name,
			lastDraftablePlayer = players[positionIndex];

		while (primaryPositionFor(lastDraftablePlayer) != positionType) {
			positionIndex--;
			// console.log(positionIndex,primaryPositionFor(lastDraftablePlayer), positionType);

			lastDraftablePlayer = players[positionIndex];
		}
		// console.log('lastDraftable:',lastDraftablePlayer)

		var minSgp = lastDraftablePlayer.sgp;
		sgpGroups.push({
			position: positionType,
			minSgp: minSgp
		});
	});

	/* --- Determine the minimum SGPs for non-rare positions --- */
	var index = players.length-1;

	var lastDraftablePlayer = players[index],
		nonExclusivePosition = true;

	while (nonExclusivePosition) {
		var bool = false;

		lastDraftablePlayer = players[index];
		scarcePositions.forEach(function (conditionalPosition) {

			if (conditionalPosition.name === lastDraftablePlayer.pos) {
				bool = true;
			}
		});

		nonExclusivePosition = bool;
		index--;
	}

	sgpGroups.push({
		position: 'default',
		minSgp: lastDraftablePlayer.sgp
	});

	return sgpGroups;
}

function assignValuesFor (players, sgpGroups, pricePerSgp, inflationRate) {

	var playersSortedBySGP = sortBy(players,'sgp').reverse();

	return playersSortedBySGP.map(function (player) {

		var value;
		if (sgpGroups.length > 0) {

			var defaultSgpGroup = sgpGroups.filter(function (sgpGroup) {
				return sgpGroup.position === 'default';
			})

			var sgpGroupMinSGP = defaultSgpGroup[0].minSgp;

			sgpGroups.forEach(function (sgpGroup) {
				if (primaryPositionFor(player) === sgpGroup.position){
					sgpGroupMinSGP = sgpGroup.minSgp;
				}
			});

			value = (((player.sgp - sgpGroupMinSGP) * pricePerSgp) + 1);// + ((sgpGroups.findBy('pos','default').get('minSgp') - sgpGroupMinSGP) * pricePerSgp);

		} else {

			value = ((player.sgp - draftablePlayers[draftablePlayers.length - 1].sgp) * pricePerSgp) + 1;

		}

		player.value = value;
		player.displayValue = value.toFixed(1);

		if (inflationRate) {
			var adjustedValue = value * inflationRate;
			player.adjustedValue = adjustedValue;
			player.displayInflatedValue = adjustedValue.toFixed(1);
			player.bidPrice = adjustedValue.toFixed(0);
		}

		return player;
	});
}

export default function assignPlayerValues (draftablePlayers, rosterSpots, allPlayers, dollarsToSpend, conditions) {

		if (draftablePlayers.length < 1) {
			return;
		}

		var scarcePositions =  conditions.filter(function (position) {
			return position.invoked;
		});

		var scarcePositionNames = scarcePositions.map(function (condition) {
			return condition.name;
		});

		var marginalSgp = 0;
		var sgpGroups = [];

		// console.log(draftablePlayers.length);
		if (scarcePositions.length > 0) {
			sgpGroups = determineSgpGroups(draftablePlayers, scarcePositions);
			// console.log('sgpGroups',sgpGroups)
			sgpGroups.forEach(function (sgpGroup) {

				var playersToCalculateFrom;

				if (sgpGroup.position === 'default') {

					playersToCalculateFrom = draftablePlayers.filter(function (draftablePlayer) {

						var notAConditionalPositionPlayer = true;

						scarcePositionNames.forEach(function (condition) {
							if (primaryPositionFor(draftablePlayer) === condition) {
								notAConditionalPositionPlayer = false;
							}
						});

						return notAConditionalPositionPlayer;
					});
				} else {

					playersToCalculateFrom = draftablePlayers.filter(function (draftablePlayer) {
						return primaryPositionFor(draftablePlayer) === sgpGroup.position;
					});

				}

				playersToCalculateFrom.forEach( function (player) {
					marginalSgp += (player.sgp - sgpGroup.minSgp);
				});

			});

		} else {

			var cumulativeSgp = 0;
			draftablePlayers.forEach(function (player) {
				cumulativeSgp += player.sgp;
			});

			var minSgp = draftablePlayers[draftablePlayers.length-1].sgp;

			marginalSgp = cumulativeSgp - (rosterSpots * minSgp);
		}

		var originalCostPerSgp = dollarsToSpend / cumulativeSgp;
		var marginalDollars = dollarsToSpend - rosterSpots;
		var pricePerSgp = marginalDollars / marginalSgp;

		// get inital value, before inflation

		allPlayers.forEach(function (player) {
			player.value = null
		})

		var initialPlayerValues = assignValuesFor(draftablePlayers, sgpGroups, pricePerSgp);

		var remainingDollars = dollarsToSpend;
		var totalSpent = 0;
		var playersDrafted = 0;

		allPlayers.forEach(function (player) {
			var subtractValue = (Number(player.cost) || 0)
			remainingDollars -= subtractValue;
			totalSpent+=subtractValue;
			if (player.isDrafted) {
				playersDrafted++;
			}
		})

		// console.log('total to spend:',dollarsToSpend)
		// console.log('dollars spent:',totalSpent)
		// console.log('players to draft',rosterSpots)
		// console.log('players drafted',playersDrafted);

		var remainingValue = dollarsToSpend;
		initialPlayerValues.forEach(function (player) {
			if (player.cost) {
				remainingValue -= player.value;
			}
		});

		// console.log(remainingDollars,remainingValue)
		var inflationRate = remainingDollars / remainingValue;
		// console.log(remainingDollars, remainingValue, inflationRate)

		// get new values, now that we know inflation
		var afterInflationPlayerValues = assignValuesFor(initialPlayerValues, sgpGroups, pricePerSgp, inflationRate);

		return rankPlayers(afterInflationPlayerValues, 'value', false);
	}

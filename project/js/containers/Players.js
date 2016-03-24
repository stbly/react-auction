import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import ValueList from '../components/ValueList'
import {players} from '../data/players'
import {settings} from '../data/settings'

import '../../stylesheets/components/app.scss'

import {sortBy} from '../utils/sortUtils';
import {filterByPosition} from '../utils/filterUtils';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			toggleBatterSortDirection: true,
			togglePitcherSortDirection: true,
			currentPitcherSortOption: '',
			currentBatterSortOption: '',
			draftableBatters:[],
			draftablePitchers:[],
			rankedBatters:[],
			rankedPitchers:[],
		}
	}

	componentDidMount () {
		this.calculateSGP('batter');
		this.calculateSGP('pitcher');
		this.setDraftablePlayerLists('batter');
		this.setDraftablePlayerLists('pitcher');
	}

	calculateSGP (type) {
		// console.log('calculating SGP');

		var _this = this;
		this.getPlayers(type).forEach(function (player){
			var index = 0;
			if (type === 'batter'){
				player.sgp = _this.getBatterSGP(player);
			} else {
				player.sgp = _this.getPitcherSGP(player);
			}

		});

		// this.setDraftablePlayerLists('batters');
		// this.setDraftablePlayerLists('pitchers');
	}

	getBatterSGP (player) {
		var totalSgp = 0,
			playerSpots = settings.numBatters,
			leagueBattingAverage = .268,
			leagueOnBasePercentage = .334,
			leagueSluggingPercentage = .436,
			averageAtBats = 475 * playerSpots,
			averagePlateAppearances = 540 * playerSpots,
			playerSpotRatio = ((playerSpots - 1) / playerSpots);

		this.getCategories('batter').forEach(function (category) {
			var sgp = 0,
				sgpd = category.sgpd,
				categoryStat = category.abbreviation,
				ratioStat = (categoryStat === 'AVG' || categoryStat === 'SLG' || categoryStat === 'OBP' || categoryStat === 'OPS');

			if (ratioStat) {

				var playerAtBats = player.AB,
					playerPlateApperances = player.PA,
					playerStat = player[categoryStat];

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
					var obpSgp = (((baseOnBaseRate + (playerPlateApperances * player.OBP)) / (basePlateAppearances + playerPlateApperances)) - leagueOnBasePercentage);
					var slgSgp = (((baseTotalBases + (playerAtBats * player.SLG)) / (baseAtBats + playerAtBats)) - leagueSluggingPercentage);

					sgp = (obpSgp + slgSgp) / sgpd;
				} else {
					sgp = ((((baseStat + (plateStat * playerStat)) / (basePlateStat + plateStat)) - leagueAverageStat) / sgpd);
				}

			} else {
				sgp = player[categoryStat] / sgpd;
			}

			totalSgp += sgp;

		});

		return totalSgp;
	}

	getPitcherSGP (player) {
		var totalSgp = 0,
			playerSpots = settings.rosterSpots - settings.numBatters,
			leagueAverageERA = 3.724,
			leagueAverageWHIP = 1.234,
			averageInningsPitched = 160 * playerSpots,
			playerSpotRatio = ((playerSpots - 1) / playerSpots);

		this.getCategories('pitcher').forEach(function (category) {
			var sgp = 0,
				sgpd = category.sgpd,
				categoryStat = category.abbreviation.toString(),
				ratioStat = (categoryStat === 'ERA' || categoryStat === 'WHIP');

			if (ratioStat) {

				var playerInningsPitched = player.IP,
					playerEarnedRuns = (playerInningsPitched * player.ERA) / 9,
					playerWalksHits = (playerInningsPitched * player.WHIP),
					playerStat = player[categoryStat];

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
				sgp = player[categoryStat] / sgpd;
			}
			totalSgp += sgp;
		});

		return totalSgp;
	}

	setDraftablePlayerLists (type) {
		var playersToDraft = this.getPlayersToDraft(type),
			playerList = this.getPlayers(type);

		var playersSortedBySGP = sortBy(playerList, 'sgp').reverse();

		var draftablePlayers = playersSortedBySGP.slice(0, playersToDraft);
		var unusedPlayers = playersSortedBySGP.slice(playersToDraft, 1000);

		var conditions = this.getScarcePositions(type);
		// console.log(conditions);

		// if (this.get('observeScarcity')) {
			conditions.forEach(function (condition) {
				var currentPlayersOfType = filterByPosition(draftablePlayers, condition.position);
				if (currentPlayersOfType.length < condition.minimum) {
					condition.invoked = true;

					var difference = condition.minimum - currentPlayersOfType.length;
					var selectableUnusedPlayers = filterByPosition(unusedPlayers, condition.position);
					var playersToAdd = selectableUnusedPlayers.slice(0,difference);
					var playersToRemove = [];
					var removeIndex = draftablePlayers.length-1;
					while (difference > 0) {
						var playerToTryRemoving = draftablePlayers[removeIndex];
						var okayToUse = true;
						conditions.forEach(function (conditionCheck) {
							if (playerToTryRemoving.pos === conditionCheck.position) {
								okayToUse = false;
							}
						});
						if (okayToUse) {
							playersToRemove.push(playerToTryRemoving);
							difference--;
						}
						removeIndex--;
					}

					playersToRemove.forEach(function (playerToRemove) {
						var index = draftablePlayers.indexOf(playerToRemove);
						draftablePlayers.splice( index, 1 );
						unusedPlayers.push(playerToRemove);
					});

					playersToAdd.forEach(function (playerToAdd){
						unusedPlayers.splice( unusedPlayers.indexOf(playerToAdd), 1 );
					});
					draftablePlayers = draftablePlayers.concat(playersToAdd);
					draftablePlayers = sortBy(draftablePlayers, 'sgp').reverse();
					unusedPlayers = sortBy(unusedPlayers, 'sgp').reverse();
				}
			});
		// }

		var index=1;
		draftablePlayers.forEach(function (player) {
			player.rank = index++;
		});

		unusedPlayers.forEach(function (player) {
			player.rank = index++;
		});

		// console.log(draftablePlayers);

		this.assignPlayerValues(draftablePlayers,type);
	}

	assignPlayerValues (playersToValue, type) {

		var draftablePlayers = playersToValue;

		if (draftablePlayers.length < 1) {
			return;
		}

		var playersToDraft = this.getPlayersToDraft(type),
			dollarsToSpend = this.getDollars(type),
			playerList = this.getPlayers(type);

		var scarcePositions =  this.getScarcePositions(type).filter(function (position) {
			return position.invoked;
		});

		var scarcePositionNames = scarcePositions.map(function (condition) {
			return condition.position;
		});

		/* ------ start determineSgpGroups() function ------ */

		var determineSgpGroups = function () {

			scarcePositions.forEach(function (position){
				/* --- Determine the minimum SGPs for each rare position --- */

				var positionIndex = draftablePlayers.length-1,
					positionType = position.position,
					lastDraftablePlayer = draftablePlayers[positionIndex];

				while (lastDraftablePlayer.pos != positionType) {
					positionIndex--;
					lastDraftablePlayer = draftablePlayers[positionIndex];
				}

				var minSgp = lastDraftablePlayer.sgp;
				sgpGroups.push({
					position: positionType,
					minSgp: minSgp
				});
			});

			/* --- Determine the minimum SGPs for non-rare positions --- */
			index = draftablePlayers.length-1;

			var lastDraftablePlayer = draftablePlayers[index],
				nonExclusivePosition = true;

			while (nonExclusivePosition) {
				var bool = false;

				lastDraftablePlayer = draftablePlayers[index];
				scarcePositionNames.forEach(function (conditionalPosition) {

					if (conditionalPosition === lastDraftablePlayer.pos) {
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

		/* ------ end determineSgpGroups() function ------ */

		/* ------ begin assignValues() function ------ */

		var assignValues = function () {

			var playersSortedBySGP = sortBy(playerList,'sgp').reverse();

			playersSortedBySGP.map(function (player) {

				var value;
				if (sgpGroups.length > 0) {

					var defaultSgpGroup = sgpGroups.filter(function (sgpGroup) {
						return sgpGroup.position === 'default';
					})

					var sgpGroupMinSGP = defaultSgpGroup[0].minSgp;

					sgpGroups.forEach(function (sgpGroup) {
						if (player.pos === sgpGroup.position){
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
					var inflatedValue = value * inflationRate;
					player.inflatedValue = inflatedValue;
					player.displayInflatedValue = inflatedValue.toFixed(1);
					player.bidPrice = inflatedValue.toFixed(0);
				}

			});
		}

		/* ------ end assignValues() function ------ */

		var marginalSgp = 0;
		var sgpGroups = [];

		if (scarcePositions.length > 0) {
			sgpGroups = determineSgpGroups(draftablePlayers, scarcePositions);

			sgpGroups.forEach(function (sgpGroup) {

				var playersToCalculateFrom;

				if (sgpGroup.position === 'default') {

					playersToCalculateFrom = draftablePlayers.filter(function (draftablePlayer) {

						var notAConditionalPositionPlayer = true;

						scarcePositionNames.forEach(function (condition) {
							if (draftablePlayer.pos === condition) {
								notAConditionalPositionPlayer = false;
							}
						});

						return notAConditionalPositionPlayer;
					});
				} else {

					playersToCalculateFrom = draftablePlayers.filter(function (draftablePlayer) {
						return draftablePlayer.pos === sgpGroup.position;
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

			marginalSgp = cumulativeSgp - (playersToDraft * minSgp);
		}

		var originalCostPerSgp = dollarsToSpend / cumulativeSgp;
		var marginalDollars = dollarsToSpend - playersToDraft;
		var pricePerSgp = marginalDollars / marginalSgp;

		// get inital value, before inflation
		assignValues();

		var remainingDollars = dollarsToSpend;
		playerList.forEach(function (player) {
			var subtractValue = (player.cost || 0)
			remainingDollars -= subtractValue;
		});

		var remainingValue = dollarsToSpend;
		draftablePlayers.forEach(function (player) {
			if (player.cost) {
				remainingValue -= player.value;
			}
		});

		var inflationRate = remainingDollars / remainingValue;
		// console.log(remainingDollars, remainingValue, inflationRate)

		// get new values, now that we know inflation
		assignValues();

		draftablePlayers = sortBy(draftablePlayers, 'value', true);

		/*var totalValue = 0;
		draftablePlayers.forEach(function (player) {
			totalValue += player.get('value')
		});*/

		var index = 1;
		draftablePlayers.forEach(function (player) {
			player.rank = index++;
		});

		if (type === 'batter') {
			this.updateBatters(draftablePlayers);
		} else {
			this.updatePitchers(draftablePlayers);
		}

	}


	getCategories (type) {
		var categoryList = [];

		for (var key in settings.categories) {
			var category = settings.categories[key];
			if (category.type === type) {
				categoryList.push(category)
			}
		}

		return categoryList;
	}

	getPlayers (type) {
		var playerList = [];

		for(var key in players) {
			var player = players[key];
			if (player.type === type) {
				player.id = key;
				playerList.push(player);
			}
		}

		return playerList;
	}

	getTotalSalary () {
		return settings.teamSalary * settings.numTeams;
	}

	getDollars (type) {
		if (type === 'batter') {
			return this.getTotalSalary() * (settings.battingPercentage / 100);
		} else {
			return this.getTotalSalary() * ((100 - settings.battingPercentage) / 100);
		}
	}

	getPlayersToDraft (type) {
		if (type === 'batter') {
			return settings.numBatters * settings.numTeams;
		} else {
			return (settings.rosterSpots - settings.numBatters) * settings.numTeams;
		}
	}

	getScarcePositions (type) {

		var positionList = settings.positions[type];
		var scarcePositions = [];

		positionList.forEach(function (position) {
			if (position.minimum) {
				scarcePositions.push(position);
			}
		});

		return scarcePositions;
	}

	sortBatters (param) {
		var playersToSort = this.state.rankedBatters;
		var sortDirection = this.state.toggleBatterSortDirection;
		var currentSortOption = this.state.currentBatterSortOption;

		if (param.toString() === currentSortOption.toString()) {
			sortDirection = !sortDirection;
			this.setState({toggleBatterSortDirection: sortDirection});
		}

		this.setState({currentBatterSortOption: param});

		playersToSort = sortBy(playersToSort, param, sortDirection);

		this.updateBatters(playersToSort, false);
	}

	sortPitchers (param) {
		var playersToSort = this.state.rankedPitchers;
		var sortDirection = this.state.togglePitcherSortDirection;
		var currentSortOption = this.state.currentPitcherSortOption;

		if (param.toString() === currentSortOption.toString()) {
			sortDirection = !sortDirection;
			this.setState({togglePitcherSortDirection: sortDirection});
		}

		this.setState({currentPitcherSortOption: param});

		playersToSort = sortBy(playersToSort, param, sortDirection);

		this.updatePitchers(playersToSort, false);
	}

	updateBatterStat (stat, value, player) {
		console.log('--- stat update',stat,player)
		var playerToUpdate = players[Number(player)];
		playerToUpdate[stat] = value;

		// console.log(playerToUpdate);

		this.calculateSGP(playerToUpdate.type);
		this.setDraftablePlayerLists(playerToUpdate.type);

	}

	updateBatterCost (cost, player) {
		console.log('---cost update',cost,player)
		var playerToUpdate = players[Number(player)];
		playerToUpdate.cost = cost;
		if (cost > 0) {
			playerToUpdate.selected = true;
		} else {
			playerToUpdate.selected = false;
		}

		// console.log(playerToUpdate);

		this.calculateSGP(playerToUpdate.type);
		this.setDraftablePlayerLists(playerToUpdate.type);

	}

	updateBatters (players, sort) {
		console.log(sort);
		(sort === null || sort === undefined) ? sort = true : sort = sort;

		if (sort && this.state.currentBatterSortOption) {
			console.log('--1',this.state.currentBatterSortOption);
			console.log ('--2',this.state.toggleBatterSortDirection);
			players = sortBy(players, this.state.currentBatterSortOption, this.state.toggleBatterSortDirection)
		}
		this.setState({rankedBatters:players});
	}

	updatePitchers (players) {
		if (this.state.currentPitcherSortOption) {
			players = sortBy(players, this.state.currentPitcherSortOption, this.state.togglePitcherSortDirection)
		}
		this.setState({rankedPitchers:players});
	}

	render() {
		return (
			<div className='players-route combined-rankings'>
				<ValueList type='batter'
					players={this.state.rankedBatters}
					categories={this.getCategories('batter')}
					sortPlayers={this.sortBatters.bind(this)}
					updateStat={this.updateBatterStat.bind(this)}
					updateCost={this.updateBatterCost.bind(this)}
				/>
				<ValueList type='pitcher'
					players={this.state.rankedPitchers}
					categories={this.getCategories('pitcher')}
					sortPlayers={this.sortPitchers.bind(this)}
					updateCost={this.updateBatterCost.bind(this)}
				/>
			</div>
		)
	}
}

export default App;

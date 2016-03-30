import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import ValueList from '../components/ValueList'
import Player from '../components/Player'
import PlayerList from '../components/PlayerList'
import PlayerInput from '../components/PlayerInput'
import FavoritedPlayerList from '../components/FavoritedPlayerList.js'
import {players} from '../data/players'
import {settings} from '../data/settings'
import {teams} from '../data/teams'

import '../../stylesheets/components/app.scss'
import '../../stylesheets/components/players.scss'

import {sortBy} from '../utils/sortUtils';
import {filterByPosition} from '../utils/filterUtils';
import classNames from 'classnames';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			draftableBatters:[],
			draftablePitchers:[],
			rankedBatters:[],
			rankedPitchers:[],
			favoritedPlayers:[],
			activePlayer:null
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

		var categories = this.getCategories('batter').filter(function (category) {
			return category.sgpd;
		});

		categories.forEach(function (category) {
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

		var categories = this.getCategories('pitcher').filter(function (category) {
			return category.sgpd;
		});

		categories.forEach(function (category) {
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

		var favoritedPlayers = this.getPlayers().filter(function (player) {
			return player.isFavorited;
		})

		this.setFavoritedPlayers(favoritedPlayers);
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
		var totalSpent = 0;
		var playersDrafted = 0;
		playerList.forEach(function (player) {
			var subtractValue = (player.cost || 0)
			remainingDollars -= subtractValue;
			totalSpent+=subtractValue;
			if (player.selected) {
				playersDrafted++;
			}
		});

		console.log('total to spend:',type,dollarsToSpend)
		console.log('dollars spent:',type,totalSpent)
		console.log('players to draft',type,playersToDraft)
		console.log('players drafted',type,playersDrafted);

		var remainingValue = dollarsToSpend;
		draftablePlayers.forEach(function (player) {
			if (player.cost) {
				remainingValue -= player.value;
			}
		});

		console.log(type,remainingDollars,remainingValue)
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

		this.updatePlayers(draftablePlayers,type);
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
			var typeMatch = true;
			if (type) {
				typeMatch = (player.type === type);
			}
			if (typeMatch) {
				player.id = key;
				playerList.push(player);
			}
		}

		return playerList;
	}

	getUnusedPlayers () {
		var unusedPlayers = [];

		for(var key in players) {
			var player = players[key];
			if (!player.selected) {
				player.id = key;
				unusedPlayers.push(player);
			}
		}

		return unusedPlayers;
	}

	getTeams () {
		var teamNames = [];

		for (var key in teams) {
			teamNames.push(key);
		}

		return teamNames
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

	setFavoritedPlayers (players) {
		console.log(players);
		this.setState({favoritedPlayers: players});
	}

	getFavoritedPlayers(type) {

		var playerList = [];
		var favoritedPlayers = this.state.favoritedPlayers.filter(function (player) {
			return player.type === type;
		});

		// console.log('getFavoritedPlayers',favoritedPlayers)

		for (var key in favoritedPlayers) {
			var player = favoritedPlayers[key];
			if (player.isFavorited && !player.selected) {
				playerList.push(player);
			}
		}

		return playerList;
	}

	updateActivePlayer (player) {
		var playerToUpdate = players[Number(player)];
		this.setState({activePlayer: playerToUpdate});
	}

	getActivePlayer () {
		if (!this.state.activePlayer) {
			return;
		}

		var el;
		var type = this.state.activePlayer.type;
		var activePlayerClasses = classNames('active-player',type);
		var tableClasses = classNames('player-list',type);
		if (this.state.activePlayer) {
			var categories = type === 'batter' ? this.getCategories('batter') : this.getCategories('pitcher');
			el = <div className={activePlayerClasses}>
					<table className={tableClasses}>
						<tbody>
							<Player
								hideMetaInfo={true}
								player={this.state.activePlayer}
								categories={categories}/>
						</tbody>
					</table>
				</div>
		}

		return el;
	}

	updateBatterStat (stat, value, player) {
		var playerToUpdate = players[Number(player)];
		playerToUpdate[stat] = value;

		// console.log(playerToUpdate);

		this.calculateSGP(playerToUpdate.type);
		this.setDraftablePlayerLists(playerToUpdate.type);
	}

	updatePlayerFavorited (makeFavorite, player) {
		var playerToUpdate = players[Number(player)];

		playerToUpdate.isFavorited = makeFavorite

		if (makeFavorite) {
			this.state.favoritedPlayers.push(playerToUpdate);
		} else {
			this.state.favoritedPlayers.splice(this.state.favoritedPlayers.indexOf(playerToUpdate), 1)
		}

		this.setFavoritedPlayers(this.state.favoritedPlayers);

		// this.calculateSGP(playerToUpdate.type);
		// this.setDraftablePlayerLists(playerToUpdate.type);
	}

	assignPlayer (playerId, cost, team) {
		// console.log(playerId, players);
		var playerToUpdate = players[Number(playerId)];
		playerToUpdate.team = team;
		this.updatePlayerCost(cost, playerId);

	}

	updatePlayerCost (cost, player) {

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

	updatePlayers (players, type) {
		if (type === 'batter') {
			this.setState({rankedBatters:players});
		} else if (type === 'pitcher') {
			this.setState({rankedPitchers:players});
		}
	}

	render() {
		return (

			<div className='players-route'>
				<div>
					<div className='favorited-players'>
						<FavoritedPlayerList
							type='batter'
							players={this.getFavoritedPlayers('batter')}
							playerSelected={this.updateActivePlayer.bind(this)}
							categories={this.getCategories('batter')}
							updateFavorited={this.updatePlayerFavorited.bind(this)} />

						<FavoritedPlayerList
							type='pitcher'
							players={this.getFavoritedPlayers('pitcher')}
							playerSelected={this.updateActivePlayer.bind(this)}
							categories={this.getCategories('pitcher')}
							updateFavorited={this.updatePlayerFavorited.bind(this)} />
						<div className='clear-both'></div>
					</div>

					<div className='combined-rankings'>
						<PlayerInput
							searchablePlayers={this.getUnusedPlayers()}
							searchableTeams={this.getTeams()}
							playerEntered={this.assignPlayer.bind(this)} />

						{this.getActivePlayer()}

						<ValueList type='batter'
							players={this.state.rankedBatters}
							categories={this.getCategories('batter')}
							playerSelected={this.updateActivePlayer.bind(this)}
							updateStat={this.updateBatterStat.bind(this)}
							updateCost={this.updatePlayerCost.bind(this)}
							updateFavorited={this.updatePlayerFavorited.bind(this)} />

						<ValueList type='pitcher'
							players={this.state.rankedPitchers}
							categories={this.getCategories('pitcher')}
							playerSelected={this.updateActivePlayer.bind(this)}
							updateCost={this.updatePlayerCost.bind(this)}
							updateFavorited={this.updatePlayerFavorited.bind(this)} />

						<div className='clear-both'></div>
					</div>

					<div className='clear-both'></div>
				</div>
			</div>
		)
	}
}

export default App;

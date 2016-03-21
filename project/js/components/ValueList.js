import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
import {bySGP} from '../utils/sortUtils';
import {filterByPosition} from '../utils/filterUtils';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import PlayerList from './PlayerList.js'

import '../../stylesheets/components/player-list.scss'



class ValueList extends Component {
	constructor(props) {
		super(props)
	}

	componentWillMount () {
		this.calculateSGP();
		this.setDraftablePlayerLists();
	}

	getCategories () {
		var categories = [];

		for(var key in this.props.categories) {
			if (this.props.categories.hasOwnProperty(key)) {
				var category = this.props.categories[key];
				categories.push(
					<td key={key} className='stat'>{category.abbreviation}</td>
				)
			}
		}

		return categories;
	}

	calculateSGP () {
		console.log('calculating SGP');

		var players = this.props.players;

		var _this = this;
		players.forEach(function (player){
			if (_this.props.type === 'batter'){
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
			playerSpots = this.props.spots,
			leagueBattingAverage = .268,
			leagueOnBasePercentage = .334,
			leagueSluggingPercentage = .436,
			averageAtBats = 475 * playerSpots,
			averagePlateAppearances = 540 * playerSpots,
			playerSpotRatio = ((playerSpots - 1) / playerSpots);

		this.props.categories.forEach(function (category) {
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
			playerSpots = this.props.spots,
			leagueAverageERA = 3.724,
			leagueAverageWHIP = 1.234,
			averageInningsPitched = 160 * playerSpots,
			playerSpotRatio = ((playerSpots - 1) / playerSpots);

		this.props.categories.forEach(function (category) {
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

	setDraftablePlayerLists () {
		var playersToDraft = this.props.playersToDraft,
			playerList = this.props.players;

		var playersSortedBySGP = playerList.sort(bySGP);

		console.log(playersSortedBySGP);

		var draftablePlayers = playersSortedBySGP.slice(1, playersToDraft);
		var unusedPlayers = playersSortedBySGP.slice(playersToDraft, 1000);

/*
		var conditions = this.props.scarcePositions;
		
		// if (this.get('observeScarcity')) {
			conditions.forEach(function (condition) {
				var currentPlayersOfType = filterByPosition(draftablePlayers, condition.position);
				// console.log('currentPlayers of Type:',currentPlayersOfType.length, condition.count)

				if (currentPlayersOfType.length < condition.count) {
					condition.set('invoked',true);
					console.log('invoked!',condition);
					var difference = condition.count - currentPlayersOfType.length;
					var selectableUnusedPlayers = filterByPosition(unusedPlayers, condition.position);
					var playersToAdd = selectableUnusedPlayers.slice(0,difference);
					var playersToRemove = [];
					var removeIndex = draftablePlayers.length-1;

					// console.log('---- players to add -----');
					// playersToAdd.forEach(function(addedPlayer){
					// 	console.log(addedPlayer.get('name'))
					// })
					// console.log('-------------------------')
					// console.log(difference);

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

					// console.log('---- players to remove -----');
					playersToRemove.forEach(function (playerToRemove) {
						var index = draftablePlayers.indexOf(playerToRemove);
						// console.log(playerToRemove.get('name'));
						draftablePlayers.splice( draftablePlayers.indexOf(playerToRemove) );
						unusedPlayers.pushObject(playerToRemove);
					});

					playersToAdd.forEach(function (playerToAdd){
						unusedPlayers.splice( unusedPlayers.indexOf(playerToAdd) );
					});

					draftablePlayers = draftablePlayers.concat(playersToAdd);
					draftablePlayers = draftablePlayers.sort(bySGP);
					unusedPlayers = unusedPlayers.sort(bySGP);
				}
			});
		// }
*/
		/*var index=0;
		unusedPlayers = unusedPlayers.map(function (player) {
			index ++;
			return Ember.Object.create({
				player: player,
				index: index
			});
		});
		*/

		this.setState({'draftablePlayers': draftablePlayers});
			// this.assignPlayerValues('pitchers');
			// this.set('model.undraftablePitchers',unusedPlayers);
			

		
	}

	render () {
		return (
			<PlayerList type={this.props.type} players={this.state.draftablePlayers} categories={this.props.categories}/>
				/*<table className={listClass}>
					<tbody>

						<tr className='headings'>
							<td className='player-info' style={smallCell}>Rank</td>
							<td className='player-info favorite-toggle' style={smallCell}>Star</td>
							<td className='player-info name'>Name</td>
							<td className='player-info position'>Position</td>
							<td className='player-info value-info'>Cost</td>
							<td className='player-info value'>Value</td>
							<td className='player-info value'>Inflation Value</td>
							{this.getCategories()}
						</tr>

						{this.getPlayers()}

					</tbody>
				</table>*/

		)
	}
}

export default ValueList;

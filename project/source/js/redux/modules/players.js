import fetch from 'isomorphic-fetch'
import {filterBy} from '../../helpers/filterUtils';
import calculateSGPFor from '../../helpers/PlayerSgpUtils'
import * as PlayerListUtils from '../../helpers/PlayerListUtils'
import * as SettingsUtils from '../../helpers/SettingsUtils'
import assignPlayerValues from '../../helpers/PlayerValueUtils'

let initialState = {
	fetching: false,
	didInvalidate: false,
	data: null,
	activePlayerId: null
}

var useLocalStorage = false

export function requestPlayers() {
	console.log('requesting players');
	return { type: 'REQUEST_PLAYERS' }
}

export function invalidatePlayers () {
	return { type: 'INVALIDATE_PLAYERS' }
}

export function receivePlayers (players) {
	return { type: 'RECEIVE_PLAYERS', players: players }
}

export function updatePlayerFavorited (playerId) {
	return { type: 'UPDATE_PLAYER_FAVORITED', id: playerId }
}

export function updatePlayerNotes (playerId, playerNotes) {
	return { type: 'UPDATE_PLAYER_NOTES', props: {id: playerId, notes: playerNotes} }
}

export function updateActivePlayer (playerId) {
	return { type: 'UPDATE_ACTIVE_PLAYER', id: playerId }
}

export function updatePlayerCost (playerCost, playerId) {
	return { type: 'UPDATE_PLAYER_COST', props: {id: playerId, cost: playerCost} }
}

export function updatePlayerStat (stat, value, playerId) {
	return {type: 'UPDATE_PLAYER_STAT', props: {id: playerId, stat: stat, value:value} }
}

export function assignPlayer (playerId, cost, team) {
	return {type: 'ASSIGN_PLAYER', props: {id: playerId, cost, team} }
}

export function fetchPlayers(state) {
	console.log('fetching...');
	return function (dispatch) {

		var storageExists = typeof(Storage) !== "undefined"
		if( storageExists && useLocalStorage ) {
			var storedPlayerData = JSON.parse(localStorage.getItem('AuctionToolPlayerList'));
			if (storedPlayerData) {
				// console.log(storedPlayerData)
				dispatch(receivePlayers(computePlayerValues(storedPlayerData, state)))
				return Promise.resolve();
			} else {
				console.log('no data in local storage')
			}

		} else {
			console.log('no local storage')
		}

		console.log('no cached data found, fetching from api');

		var url = process.env.NODE_ENV === 'development' ? '/api/players' : './data/players.json'
		dispatch(requestPlayers())

		var config = {
			credentials: 'same-origin'
		}

		return fetch(url, config)
			.then(function(response) {
				response.json().then(function(data) {
					dispatch(receivePlayers(synthesizePlayerData(Object.toArray(data), state)))
				});
			})
	}
}

export function fetchPlayersIfNeeded() {
	console.log('fetchPlayersIfNeeded()')
	return (dispatch, getState) => {


		var state = getState()

	    if (shouldFetchPlayers(state)) {
	    	console.log('need to fetch players again')
			return dispatch(fetchPlayers(state))
	    } else {
	    	console.log('dont need to fetch players again')

	    	if (shouldRecalculatePlayers(state)) {
		    	console.log('need to recalculate players')
		    	dispatch(receivePlayers(computePlayerValues(state.players.data, state)))
	    	}
	      // Let the calling code know there's nothing to wait for.
	      return Promise.resolve()
	    }
	}
}


export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'INVALIDATE_PLAYERS':
			console.log('----- player reducer: INVALIDATE_PLAYERS');
			return Object.assign({}, state, {
				didInvalidate: true
			});

		case 'REQUEST_PLAYERS':
			console.log('----- player reducer: REQUEST_PLAYERS');
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case 'RECEIVE_PLAYERS':
			console.log('----- player reducer: RECEIVE_PLAYERS');
			console.log('receiving players');
			var newState = Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.players
				// playerLists: returnPlayerLists( action.players )
			});

			if (useLocalStorage) {
				localStorage.setItem('AuctionToolPlayerList',JSON.stringify(newState.data));
			}

			return newState;

		case 'UPDATE_PLAYER_FAVORITED':
			console.log('----- player reducer: UPDATE_PLAYER_FAVORITED');
			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === action.id) {
					return Object.assign({}, player, {
						isFavorited: !player.isFavorited
					})
				}
				return player
			})

			if (useLocalStorage) {
				localStorage.setItem('AuctionToolPlayerList',JSON.stringify(updatedPlayers));
			}

			return Object.assign({}, state, {
				data: updatedPlayers,
				// playerLists: returnPlayerLists( updatedPlayers ),
			});

		case 'UPDATE_PLAYER_NOTES':
			console.log('----- player reducer: UPDATE_PLAYER_NOTES');
			var {id, notes} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					return Object.assign({}, player, {
						notes: notes
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				// playerLists: returnPlayerLists( updatedPlayers ),
			});

		case 'UPDATE_ACTIVE_PLAYER':
			console.log('----- player reducer: UPDATE_ACTIVE_PLAYER');
			return Object.assign({}, state, {
				activePlayerId: action.id
			});

		case 'UPDATE_PLAYER_COST':
			console.log('----- player reducer: UPDATE_PLAYER_COST');
			var {id, cost} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isDrafted = (cost > 0);
					var team = isDrafted ? player.team : null;
					console.log("isDrafted:",isDrafted,"cost",cost)
					return Object.assign({}, player, {
						cost: isDrafted ? cost : null,
						isDrafted: isDrafted,
						team: team
					})

				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				// playerLists: returnPlayerLists( updatedPlayers ),
				didInvalidate: true
			});

		case 'UPDATE_PLAYER_STAT':
			console.log('----- player reducer: UPDATE_PLAYER_STAT');
			var {id, stat, value} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					player.stats = Object.assign({}, player.stats, {
						[stat]: value
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				// playerLists: returnPlayerLists( updatedPlayers ),
				didInvalidate: true
			});


		case 'ASSIGN_PLAYER':
			console.log('----- player reducer: ASSIGN_PLAYER');
			var {id, cost, team} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isDrafted = (cost > 0);
					return Object.assign({}, player, {
						team: team,
						cost: cost,
						isDrafted: isDrafted
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				// playerLists: returnPlayerLists( updatedPlayers ),
				didInvalidate: true
			});

		default:
			return state;
	}
}


function shouldFetchPlayers(state) {
	var players = state.players.data;
	if (!players && !state.players.fetching) {
		return true
	} else {
		return false
	}
}

function shouldRecalculatePlayers(state) {
	return state.players.didInvalidate
}

function returnPlayerLists (players) {
	var rankedBatters = players.filter( player => (player.value && player.type === 'batter')),
		rankedPitchers = players.filter( player => (player.value && player.type === 'pitcher')),
		unusedBatters = players.filter( player => (!player.value && player.type === 'batter')),
		unusedPitchers = players.filter( player => (!player.value && player.type === 'pitcher'));

	return {rankedBatters, rankedPitchers, unusedBatters, unusedPitchers}
}

function synthesizePlayerData (players, state) {
	// var userPlayers = state.user.players
	var playerArray = Object.toArray(players);

	return computePlayerValues(playerArray.map(player => {
		player.stats = player.stats.default
		return player
	}), state);
}

function computePlayerValues (players, state) {
	var	{numTeams, teamSalary, startingSalary, battingPercentage, rosterSpots, numBatters} = state.settings.data,
		categories = state.categories.data,
		positions = state.positions.data,
		teams = state.teams.data;

	var batters = filterBy(players, 'type', 'batter'),
		pitchers = filterBy(players, 'type', 'pitcher');

	var battingCategories = SettingsUtils.getCategories(categories.batter),
		pitchingCategories = SettingsUtils.getCategories(categories.pitcher);

	var numPitchers = rosterSpots - numBatters;

	var battersWithSGP = calculateSGPFor(batters, battingCategories, numBatters, 'batter'),
		pitchersWithSGP = calculateSGPFor(pitchers, pitchingCategories, numPitchers, 'pitcher');

	var numBattersToDraft = numBatters * numTeams,
		numPitchersToDraft = (rosterSpots - numBatters) * numTeams;

	var batterConditions = SettingsUtils.getScarcePositions(positions[0].positions),
		pitcherConditions = SettingsUtils.getScarcePositions(positions[1].positions);

	var [draftableBatters, unusedBatters] = PlayerListUtils.getPlayerList(battersWithSGP, numBattersToDraft, batterConditions);
	var	[draftablePitchers, unusedPitchers] = PlayerListUtils.getPlayerList(pitchersWithSGP, numPitchersToDraft, pitcherConditions);

	var totalSalary = teamSalary * numTeams;

	var battingDollarsToSpend = totalSalary * (battingPercentage / 100),
		pitchingDollarsToSpend = totalSalary * ((100 - battingPercentage) / 100);

	var rankedBatters = assignPlayerValues(draftableBatters, numBattersToDraft, batters, battingDollarsToSpend, batterConditions),
		rankedPitchers = assignPlayerValues(draftablePitchers, numPitchersToDraft, pitchers, pitchingDollarsToSpend, pitcherConditions);

		var totalBattingMoney = rankedBatters.reduce((total, player) => {
			return total + player.adjustedValue
		},0);
		console.log(rankedBatters,battingDollarsToSpend,totalBattingMoney)

	var allPlayers = [].concat(rankedBatters, rankedPitchers, unusedBatters, unusedPitchers);

	return allPlayers
}
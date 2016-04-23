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
	playerLists: {
		rankedBatters: [],
		rankedPitchers: [],
	},
	activePlayerId: null
}

export function requestPlayers() {
	console.log('requesting players');
	return { type: 'REQUEST_PLAYERS' }
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

		var url = '/api/players';

		dispatch(requestPlayers())

		return fetch(url)
			.then(function(response) {
				response.json().then(function(data) {
					dispatch(receivePlayers(computePlayerValues(data, state)))
				});
			})
	}
}

export function fetchPlayersIfNeeded() {
	return (dispatch, getState) => {

		var state = getState()

	    if (shouldFetchPlayers(state)) {
	    	console.log('need to fetch players again')
			return dispatch(fetchPlayers(state))
	    } else {
	    	console.log('dont need to fetch players again')

	    	if (shouldRecalculatePlayers(state)) {
		    	console.log('need to recalculate players')

	    		computePlayerValues(state.players.data, state)
	    	}
	      // Let the calling code know there's nothing to wait for.
	      return Promise.resolve()
	    }
	}
}


export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'INVALIDATE_PLAYERS':
			return Object.assign({}, state, {
				didInvalidate: true
			});
			break;

		case 'REQUEST_PLAYERS':
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: false
			});

		case 'RECEIVE_PLAYERS':
			console.log('receiving players');
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.players,
				playerLists: returnPlayerLists( action.players ),

			});

		case 'UPDATE_PLAYER_FAVORITED':
			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === action.id) {
					return Object.assign({}, player, {
						isFavorited: !player.isFavorited
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				playerLists: returnPlayerLists( updatedPlayers ),
			});

		case 'UPDATE_PLAYER_NOTES':
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
				playerLists: returnPlayerLists( updatedPlayers ),
			});

		case 'UPDATE_ACTIVE_PLAYER':
			return Object.assign({}, state, {
				activePlayerId: action.id
			});

		case 'UPDATE_PLAYER_COST':
			var {id, cost} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isSelected = (cost > 0);
					return Object.assign({}, player, {
						cost: cost,
						isSelected: isSelected
					})

				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				playerLists: returnPlayerLists( updatedPlayers ),
				didInvalidate: true
			});

		case 'UPDATE_PLAYER_STAT':
			var {id, stat, value} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					return Object.assign({}, player, {
						[stat]: value
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				playerLists: returnPlayerLists( updatedPlayers ),
				didInvalidate: true
			});

		case 'ASSIGN_PLAYER':
			var {id, cost, team} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isSelected = (cost > 0);
					return Object.assign({}, player, {
						team: team,
						cost: cost,
						isSelected: isSelected
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers,
				playerLists: returnPlayerLists( updatedPlayers ),
				isInvalidated: true
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

	var allPlayers = [].concat(rankedBatters, rankedPitchers, unusedBatters, unusedPitchers);

	return allPlayers
}
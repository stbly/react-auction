import fetch from 'isomorphic-fetch'
import { firebaseRef } from '../modules/user'
import * as PlayerListUtils from '../../helpers/PlayerListUtils'
import computePlayerValues from '../../helpers/PlayerValueUtils'

let initialState = {
	fetching: false,
	didInvalidate: true,
	data: null,
	activePlayerId: null
}

const LOADING_PLAYER_DATA = 'players/LOADING_PLAYER_DATA'
const INVALIDATE_PLAYERS = 'players/INVALIDATE_PLAYERS'
const RECEIVE_PLAYERS = 'players/RECEIVE_PLAYERS'
const UPDATE_PLAYER_FAVORITED = 'players/UPDATE_PLAYER_FAVORITED'
const UPDATE_PLAYER_NOTES = 'players/UPDATE_PLAYER_NOTES'
const UPDATE_ACTIVE_PLAYER = 'players/UPDATE_ACTIVE_PLAYER'
const UPDATE_PLAYER_COST = 'players/UPDATE_PLAYER_COST'
const UPDATE_PLAYER_STAT = 'players/UPDATE_PLAYER_STAT'
const ASSIGN_PLAYER = 'players/ASSIGN_PLAYER'

export function loadingPlayerData() {
	console.log('loadingPlayerData');
	return { type: LOADING_PLAYER_DATA }
}

export function invalidatePlayers () {
	return { type: INVALIDATE_PLAYERS }
}

export function receivePlayers (players) {
	return { type: RECEIVE_PLAYERS, players: players }
}

export function updatePlayerFavorited (playerId) {
	return { type: UPDATE_PLAYER_FAVORITED, id: playerId }
}

export function updatePlayerNotes (playerId, notes) {
return { type: UPDATE_PLAYER_NOTES, props: {id: playerId, notes} }
}

export function updateActivePlayer (playerId) {
	return { type: UPDATE_ACTIVE_PLAYER, id: playerId }
}

export function updatePlayerCost (cost, playerId) {
	return { type: UPDATE_PLAYER_COST, props: {id: playerId, cost} }
}

export function updatePlayerStat (stat, value, playerId) {
	return {type: UPDATE_PLAYER_STAT, props: {id: playerId, stat, value} }
}

export function assignPlayer (playerId, cost, team) {
	return {type: ASSIGN_PLAYER, props: {id: playerId, cost, team} }
}

export function getCustomValues(players) {
	return function (dispatch, getState) {
		var state = getState()

		console.log('getCustomValues',players)

    	if (shouldRecalculatePlayers(state)) {
    		dispatch( loadingPlayerData() )
	    	console.log('need to recalculate players')
	    	players = computePlayerValues(players, state)
    	}

    	dispatch( receivePlayers(players) )
		return Promise.resolve()
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


// export function statesIfNeeded() {
// 	console.log('fetchPlayersIfNeeded()')
// 	return (dispatch, getState) => {


// 		var state = getState()

// 	    if (shouldFetchPlayers(state)) {
// 	    	console.log('need to fetch players again')
// 			return dispatch(fetchPlayers(state))
// 	    } else {
// 	    	console.log('dont need to fetch players again')

// 	    	if (shouldRecalculatePlayers(state)) {
// 		    	console.log('need to recalculate players')
// 		    	dispatch(receivePlayers(computePlayerValues(state.players.data, state)))
// 	    	}
// 	      // Let the calling code know there's nothing to wait for.
// 	      return Promise.resolve()
// 	    }
// 	}
// }

function reducer (state = initialState, action) {

	switch (action.type) {
		case INVALIDATE_PLAYERS:
			return Object.assign({}, state, {
				didInvalidate: true
			});

		case LOADING_PLAYER_DATA:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case RECEIVE_PLAYERS:
			console.log('receiving players');
			var newState = Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.players
				// playerLists: returnPlayerLists( action.players )
			});

			return newState;

		case UPDATE_PLAYER_FAVORITED:
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
				// playerLists: returnPlayerLists( updatedPlayers ),
			});

		case UPDATE_PLAYER_NOTES:
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

		case UPDATE_ACTIVE_PLAYER:
			return Object.assign({}, state, {
				activePlayerId: action.id
			});

		case UPDATE_PLAYER_COST:
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

		case UPDATE_PLAYER_STAT:
			var {id, stat, value} = action.props;

			console.log('-------------------')
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


		case ASSIGN_PLAYER:
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

/*function returnPlayerLists (players) {
	var rankedBatters = players.filter( player => (player.value && player.type === 'batter')),
		rankedPitchers = players.filter( player => (player.value && player.type === 'pitcher')),
		unusedBatters = players.filter( player => (!player.value && player.type === 'batter')),
		unusedPitchers = players.filter( player => (!player.value && player.type === 'pitcher'));

	return {rankedBatters, rankedPitchers, unusedBatters, unusedPitchers}
}*/
/*
function synthesizePlayerData (players, state) {
	// var userPlayers = state.user.players
	console.log('=====synthesizePlayerData')
	var playerArray = Object.toArray(players);
	console.log('=====done synthesis')
	return computePlayerValues(playerArray.map(player => {
		player.stats = player.stats.default
		return player
	}), state);
}*/

export default reducer
export {
	LOADING_PLAYER_DATA,
	INVALIDATE_PLAYERS,
	RECEIVE_PLAYERS,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES,
	UPDATE_ACTIVE_PLAYER,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_STAT,
	ASSIGN_PLAYER
}
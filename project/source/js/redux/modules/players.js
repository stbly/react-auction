import fetch from 'isomorphic-fetch'
import { firebaseRef } from '../modules/user'
import * as PlayerListUtils from '../../helpers/PlayerListUtils'
import computePlayerValues from '../../helpers/PlayerValueUtils'

let initialState = {
	fetching: false,
	didInvalidate: true,
	didUnsynthesize: true,
	data: null,
	activePlayerId: null
}

const LOAD_PLAYERS_REQUEST = 'players/LOAD_PLAYERS_REQUEST'
const LOAD_PLAYERS_SUCCESS = 'players/LOAD_PLAYERS_SUCCESS'
const LOAD_PLAYERS_ERROR = 'players/LOAD_PLAYERS_ERROR'

const LOAD_USER_PLAYERS_REQUEST = 'players/LOAD_USER_PLAYERS_REQUEST'
const LOAD_USER_PLAYERS_SUCCESS = 'players/LOAD_USER_PLAYERS_SUCCESS'
const LOAD_USER_PLAYERS_ERROR = 'players/LOAD_USER_PLAYERS_ERROR'

const RECEIVE_PLAYERS = 'players/RECEIVE_PLAYERS'
const INVALIDATE_PLAYERS = 'players/INVALIDATE_PLAYERS'
const UPDATE_PLAYER_FAVORITED = 'players/UPDATE_PLAYER_FAVORITED'
const UPDATE_PLAYER_NOTES = 'players/UPDATE_PLAYER_NOTES'
const UPDATE_ACTIVE_PLAYER = 'players/UPDATE_ACTIVE_PLAYER'
const UPDATE_PLAYER_COST = 'players/UPDATE_PLAYER_COST'
const UPDATE_PLAYER_STAT = 'players/UPDATE_PLAYER_STAT'
const ASSIGN_PLAYER = 'players/ASSIGN_PLAYER'

export function getPlayers (endpoint) {
	return {
		types: [LOAD_PLAYERS_REQUEST, LOAD_PLAYERS_SUCCESS, LOAD_PLAYERS_ERROR ],
		endpoint
		// payload: { didUnsynthesize: !defaultPlayers }
	}
}

export function fetchPlayers () {
	return function (dispatch, getState) {
		const state = getState()

		return dispatch( getPlayers('/players') ) // Load default player data
			.then( players => {
				const scrubbedPlayers = scrubPlayerData(players) // Format player data properly

				if (state.user.uid && state.players.didUnsynthesize) {
					return dispatch ( getPlayers('/users/' + uid + '/players') ) // Get Player Data
						.then( userPlayers => {
							const syncedPlayers = synthesizePlayerData (scrubbedPlayers, userPlayers) // Sync Default & User Player Data
							return dispatch ( calculatePlayers(syncedPlayers) ) // Send out player data
						})
				} else {
					return dispatch ( calculatePlayers(scrubbedPlayers) ) // Send out player data
				}
			})

	}
}

function calculatePlayers (players) {
	return function (dispatch, getState) {
		const state = getState()
		const { didInvalidate } = state.players
		if (didInvalidate) {
			players = computePlayerValues(players, state)
		}
		dispatch (receivePlayers(players))
	}
}

function scrubPlayerData (players) {
	for (const id in players) {
		if (players.hasOwnProperty(id)) {
			var statsExist = players[id].stats
			if (statsExist) {
				if (players[id].stats.default) {
					players[id].stats = players[id].stats.default
				}
			}
		}
	}
	return players
}

function synthesizePlayerData (playerData, userPlayerData) {
	for (const userPlayerId in userPlayerData) {
		if (userPlayerData.hasOwnProperty(userPlayerId)) {
			const playerStats = playerData[userPlayerId].stats
			const userStats = userPlayerData[userPlayerId].stats
			const mergedStats = Object.assign({}, playerStats, userStats)
			console.log(mergedStats)
			playerData[userPlayerId].stats = mergedStats
		}
	}
	return playerData
}

export function receivePlayers (payload) {
	return {type: RECEIVE_PLAYERS, payload}
}


export function fetchPlayersIfNeeded () {
	return function (dispatch, getState) {
		var state = getState()

	    if (shouldFetchPlayers(state)) {
	    	console.log('need to fetch players again')
			return dispatch(fetchPlayers(state))
	    } else {
	    	console.log('dont need to fetch players again')

			if (state.players.didInvalidate) {
				console.log('need to recalculate players')
				dispatch(receivePlayers(state.players.data))
	    	}
			// Let the calling code know there's nothing to wait for.
			return Promise.resolve()
	    }
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

/*
export function fetchPlayerData () {
	return function (dispatch, getState) {

		return firebase.database().ref('/players').once('value').then( snapshot => {
			var players = snapshot.val()
			// firebase.database().ref('/players').once('value').then

			for (var id in players) {
				if (players.hasOwnProperty(id)) {
					var statsExist = players[id].stats
					if (statsExist) {
						players[id].stats = players[id].stats.default
					}
				}
			}

			return synthesizePlayerData(players).then( synthesizedPlayers => {
				return synthesizedPlayers
			})
		})
	}
}*/


export function invalidatePlayers () {
	return { type: INVALIDATE_PLAYERS }
}

export function loadPlayersRequest () {
	return { type: loadPlayersRequest }
}

export function updatePlayerFavorited (playerId) {
	return { type: UPDATE_PLAYER_FAVORITED, id: playerId }
}

export function updatePlayerNotes (playerId, notes) {
return { type: UPDATE_PLAYER_NOTES, payload: {id: playerId, notes} }
}

export function updateActivePlayer (playerId) {
	return { type: UPDATE_ACTIVE_PLAYER, id: playerId }
}

export function updatePlayerCost (cost, playerId) {
	return { type: UPDATE_PLAYER_COST, payload: {id: playerId, cost} }
}

export function updatePlayerStat (stat, value, playerId) {
	return {type: UPDATE_PLAYER_STAT, payload: {id: playerId, stat, value} }
}

export function assignPlayer (playerId, cost, team) {
	return {type: ASSIGN_PLAYER, payload: {id: playerId, cost, team} }
}
/*
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


*/


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

		case LOAD_PLAYERS_REQUEST:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case RECEIVE_PLAYERS:
			console.log('receiving players');
			console.log(action.payload)
			var newState = Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.payload
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
			var {id, notes} = action.payload;

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
			var {id, cost} = action.payload;

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
			var {id, stat, value} = action.payload;
			return Object.assign({}, state, {
				didInvalidate: true,
				data: Object.assign({}, state.data, {
					[id]: Object.assign({}, state.data[id], {
						stats: Object.assign({}, state.data[id].stats, {
							[stat]: value
						})
					})
				})
			})


		case ASSIGN_PLAYER:
			var {id, cost, team} = action.payload;

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
	LOAD_PLAYERS_REQUEST,
	INVALIDATE_PLAYERS,
	RECEIVE_PLAYERS,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES,
	UPDATE_ACTIVE_PLAYER,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_STAT,
	ASSIGN_PLAYER
}
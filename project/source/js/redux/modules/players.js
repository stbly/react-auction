import fetch from 'isomorphic-fetch'
import { firebaseRef } from '../modules/user'
import { scrubPlayerData, synthesizePlayerData } from '../../helpers/PlayerListUtils'
import computePlayerValues from '../../helpers/PlayerValueUtils'

let initialState = {
	fetching: false,
	didInvalidate: true,
	didUnsynthesize: false,
	forceReload: false,
	data: null,
	activePlayerId: null
}

const LOAD_PLAYERS_REQUEST = 'players/LOAD_PLAYERS_REQUEST'
const LOAD_PLAYERS_SUCCESS = 'players/LOAD_PLAYERS_SUCCESS'
const LOAD_PLAYERS_ERROR = 'players/LOAD_PLAYERS_ERROR'
const FORCE_LOAD_PLAYERS = 'players/FORCE_LOAD_PLAYERS'
const RECEIVE_PLAYERS = 'players/RECEIVE_PLAYERS'
const INVALIDATE_PLAYERS = 'players/INVALIDATE_PLAYERS'
const UNSYNTHESIZE_PLAYERS = 'players/UNSYNTHESIZE_PLAYERS'
const UPDATE_PLAYER_FAVORITED = 'players/UPDATE_PLAYER_FAVORITED'
const UPDATE_PLAYER_NOTES = 'players/UPDATE_PLAYER_NOTES'
const UPDATE_ACTIVE_PLAYER = 'players/UPDATE_ACTIVE_PLAYER'
const UPDATE_PLAYER_COST = 'players/UPDATE_PLAYER_COST'
const UPDATE_PLAYER_STAT = 'players/UPDATE_PLAYER_STAT'

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
		const { didInvalidate } = state.players
		// console.log('fetchPlayers')
		return dispatch( fetchDefaultPlayers() )
			.then( players => dispatch( fetchUserPlayers() )
				.then( userPlayers => {
					const defaultPlayers = players || state.players.data
					const synthesizedPlayers = synthesizePlayerData(defaultPlayers, userPlayers)
					return dispatch(receivePlayers(synthesizedPlayers))
				}
			)
	    )
	}
}

function fetchDefaultPlayers () {
	return function (dispatch, getState) {
		const state = getState()
		const { data, fetching, forceReload } = state.players
		const shouldFetchPlayers = ((!data || forceReload) && !fetching)

		if (shouldFetchPlayers) {
			return dispatch( getPlayers('/players') ) // Load default player data
				.then( players => scrubPlayerData(players) )
		} else {
			return Promise.resolve()
		}
	}
}

function fetchUserPlayers () {
	return function (dispatch, getState) {
		const state = getState()
		const { uid, didInvalidate } = state.user
		const { fetching, didUnsynthesize } = state.players
		const shouldFetchUserPlayers = (uid && didUnsynthesize && !fetching)
		// console.log('FETCH USER PLAYERS?',uid, didUnsynthesize, fetching)
		if (shouldFetchUserPlayers) {
			return dispatch ( getPlayers('/users/' + uid + '/players') ) // Get Player Data
				.then( userPlayers => userPlayers )
		} else {
			return Promise.resolve()
		}
	}
}

export function changePlayerStat (id, stat, value) {
	return function (dispatch, getState) {
		dispatch( updatePlayerStat(id, stat, value) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export function changePlayerCost (id, cost) {
	return function (dispatch, getState) {
		dispatch( updatePlayerCost(id, cost) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export function assignPlayer (id, cost, team) {
	return function (dispatch, getState) {
		dispatch( updatePlayerCost(id, cost) )
		// dispatch( updatePlayerTeam(id, team) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export function receivePlayers (players) {
	return {type: RECEIVE_PLAYERS, payload: {players}}
}

export function invalidatePlayers () {
	return { type: INVALIDATE_PLAYERS }
}

export function unsynthesizePlayers () {
	console.log('unsynthesizePlayers()')
	return { type: UNSYNTHESIZE_PLAYERS }
}

export function loadPlayersRequest () {
	return { type: loadPlayersRequest }
}

export function forceLoadPlayers () {
	return { type: FORCE_LOAD_PLAYERS }
}

export function updatePlayerFavorited (id) {
	return { type: UPDATE_PLAYER_FAVORITED, payload: {id} }
}

export function updatePlayerStat(id, stat, value) {
	return {type: UPDATE_PLAYER_STAT, payload: {id, stat, value}}
}

export function updatePlayerNotes (id, notes) {
	return { type: UPDATE_PLAYER_NOTES, payload: {id, notes} }
}

export function updateActivePlayer (id) {
	return { type: UPDATE_ACTIVE_PLAYER, payload: {id} }
}

export function updatePlayerCost (id, cost) {
	return { type: UPDATE_PLAYER_COST, payload: {id, cost} }
}

function reducer (state = initialState, action) {

	const { payload } = action
	const { players, id, cost, value, team, notes, stat } = (payload || {})

	switch (action.type) {
		case INVALIDATE_PLAYERS:
			return Object.assign({}, state, {
				didInvalidate: true
			});

		case FORCE_LOAD_PLAYERS:
			return Object.assign({}, state, {
				forceReload: true
			})

		case UNSYNTHESIZE_PLAYERS:
			return Object.assign({}, state, {
				didUnsynthesize: true
			});

		case LOAD_PLAYERS_REQUEST:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case LOAD_PLAYERS_SUCCESS:
			return Object.assign({}, state, {
				fetching: false,
				forceReload: false
			});

		case RECEIVE_PLAYERS:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				didUnsynthesize: false,
				data: players
				// playerLists: returnPlayerLists( action.players )
			});

		case UPDATE_PLAYER_FAVORITED:
			return Object.assign({}, state, {
				data: Object.assign({}, state.data, {
					[id]: Object.assign({}, state.data[id], {
						isFavorited: !state.data[id].isFavorited
					})
				})
			})

		case UPDATE_PLAYER_NOTES:
			return Object.assign({}, state, {
				data: Object.assign({}, state.data, {
					[id]: Object.assign({}, state.data[id], {
						notes
					})
				})
			})

		case UPDATE_ACTIVE_PLAYER:
			return Object.assign({}, state, {
				activePlayerId: id
			});

		case UPDATE_PLAYER_COST:
			return Object.assign({}, state, {
				didInvalidate: true,
				data: Object.assign({}, state.data, {
					[id]: Object.assign({}, state.data[id], {
						cost: cost > 0 ? cost : null
					})
				})
			})

		case UPDATE_PLAYER_STAT:
			return Object.assign({}, state, {
				didInvalidate: true,
				data: Object.assign({}, state.data, {
					[id]: Object.assign({}, state.data[id], {
						stats: Object.assign({}, state.data[id].stats, {
							[stat]: Number(value)
						})
					})
				})
			})

		default:
			return state;
	}
}

export default reducer
export {
	LOAD_PLAYERS_REQUEST,
	INVALIDATE_PLAYERS,
	RECEIVE_PLAYERS,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES,
	UPDATE_ACTIVE_PLAYER,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_STAT
}
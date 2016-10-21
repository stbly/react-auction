import fetch from 'isomorphic-fetch'
import { defaultPlayers } from '../../helpers/constants.js'

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


let initialState = {
	fetching: false,
	didInvalidate: true,
	didUnsynthesize: false,
	forceReload: false,
	data: null,
	activePlayerId: null
}

const scrubPlayerData = (players) => {
	for (const id in players) {
		if (players.hasOwnProperty(id)) {
			if (players[id].stats) {
				if (players[id].stats.default) {
					const stats = players[id].stats.default
					const newStats = {}

					for (const stat in stats) {
						if (stats.hasOwnProperty(stat)) {
							const val = stats[stat] || 0
							newStats[stat] = val
						}
					}

					players[id].stats = newStats
				}
			}
		}
	}
	return players
}

const synthesizePlayerData = (playerData, userPlayerData=null) => {
	if (userPlayerData) {
		for (const userPlayerId in userPlayerData) {
			if (userPlayerData.hasOwnProperty(userPlayerId)) {

				const player = playerData[userPlayerId]
				const userPlayer = userPlayerData[userPlayerId]

				for (const key in userPlayer) {
					if (userPlayer.hasOwnProperty(key)) {

						if (!player[key]) {
							player[key] = userPlayer[key]
						} else {
							Object.assign(player[key], userPlayer[key])
						}

					}
				}
			}
		}
	}
	return playerData
}

export const getPlayers = (endpoint) => {
	return {
		types: [LOAD_PLAYERS_REQUEST, LOAD_PLAYERS_SUCCESS, LOAD_PLAYERS_ERROR ],
		endpoint
		// payload: { didUnsynthesize: !defaultPlayers }
	}
}

export const fetchPlayers = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { didInvalidate } = state.players
		const debug = false //!navigator.onLine //true

		if (debug) {
			return dispatch( fetchOfflinePlayerData() )
		}

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

const fetchOfflinePlayerData = () => {
	return (dispatch, getState) => {
		const players = scrubPlayerData(defaultPlayers)
		dispatch( receivePlayers(players) )
		return Promise.resolve()
	}
}

const fetchDefaultPlayers = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { data, fetching, forceReload } = state.players
		const shouldFetchPlayers = ((!data || forceReload) && !fetching)
		if (shouldFetchPlayers) {
			return dispatch( getPlayers('/defaults/players') ) // Load default player data
				.then( players => scrubPlayerData(players) )
		} else {
			return Promise.resolve()
		}
	}
}

const fetchUserPlayers = () => {
	return (dispatch, getState) => {
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

export const changePlayerStat = (id, stat, value) => {
	return (dispatch, getState) => {
		dispatch( updatePlayerStat(id, stat, value) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export const changePlayerCost = (id, cost) => {
	return (dispatch, getState) => {
		dispatch( updatePlayerCost(id, cost) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export const assignPlayer = (id, cost, team) => {
	return (dispatch, getState) => {
		dispatch( updatePlayerCost(id, cost) )
		// dispatch( updatePlayerTeam(id, team) )
		const players = getState().players.data
		return dispatch( receivePlayers(players) )
	}
}

export const receivePlayers = (players) => {
	return {type: RECEIVE_PLAYERS, payload: {players}}
}

export const invalidatePlayers = () => {
	return { type: INVALIDATE_PLAYERS }
}

export const unsynthesizePlayers = () => {
	console.log('unsynthesizePlayers()')
	return { type: UNSYNTHESIZE_PLAYERS }
}

export const loadPlayersRequest = () => {
	return { type: loadPlayersRequest }
}

export const forceLoadPlayers = () => {
	return { type: FORCE_LOAD_PLAYERS }
}

export const updatePlayerFavorited = (id) => {
	return { type: UPDATE_PLAYER_FAVORITED, payload: {id} }
}

export const updatePlayerStat= (id, stat, value) => {
	return {type: UPDATE_PLAYER_STAT, payload: {id, stat, value}}
}

export const updatePlayerNotes = (id, notes) => {
	return { type: UPDATE_PLAYER_NOTES, payload: {id, notes} }
}

export const updateActivePlayer = (id) => {
	return { type: UPDATE_ACTIVE_PLAYER, payload: {id} }
}

export const updatePlayerCost = (id, cost) => {
	return { type: UPDATE_PLAYER_COST, payload: {id, cost} }
}

const reducer = (state = initialState, action) => {

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

		case LOAD_PLAYERS_ERROR:
			console.log("LOAD_PLAYERS_ERROR")
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: true
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
/*
// TO DO //

~ Figure out if we need both didInvalidate and didUnsynthesize

///////////
*/

import fetch from 'isomorphic-fetch'

import { defaultLeagues } from '../../helpers/constants/defaultLeagues'

import {
	fetchPlayers,
	unsynthesizePlayers } from './players'

const LOAD_LEAGUES_REQUEST = 'leagues/LOAD_LEAGUES_REQUEST'
const LOAD_LEAGUES_SUCCESS = 'leagues/LOAD_LEAGUES_SUCCESS'
const LOAD_LEAGUES_ERROR = 'leagues/LOAD_LEAGUES_ERROR'
const RECEIVE_LEAGUES = 'players/RECEIVE_LEAGUES'
const INVALIDATE_LEAGUES = 'players/INVALIDATE_LEAGUES'
const UNSYNTHESIZE_LEAGUES = 'players/UNSYNTHESIZE_LEAGUES'
const UPDATE_ACTIVE_LEAGUE = 'players/UPDATE_ACTIVE_LEAGUE'
const UPDATE_ACTIVE_LEAGUE_NAME = 'players/UPDATE_ACTIVE_LEAGUE_NAME'
const CREATE_LEAGUE = 'players/CREATE_LEAGUE'

import { fetchSettings } from './settings'
import { fetchTeams } from './teams'

let initialState = {
	fetching: false,
	didInvalidate: true,
	didUnsynthesize: true,
	forceReload: false,
	data: {},
	activeLeague: null
}

const synthesizeLeagueData = (playerData, userLeagueData=null) => {
	if (userLeagueData) {
		for (const userLeagueId in userLeagueData) {
			if (userLeagueData.hasOwnProperty(userLeagueId)) {

				const player = playerData[userLeagueId]
				const userLeague = userLeagueData[userLeagueId]

				for (const key in userLeague) {
					if (userLeague.hasOwnProperty(key)) {

						if (!player[key]) {
							player[key] = userLeague[key]
						} else {
							Object.assign(player[key], userLeague[key])
						}

					}
				}
			}
		}
	}
	return playerData
}

export const getLeagues = (endpoint) => {
	return {
		types: [LOAD_LEAGUES_REQUEST, LOAD_LEAGUES_SUCCESS, LOAD_LEAGUES_ERROR ],
		endpoint
		// payload: { didUnsynthesize: !defaultLeagues }
	}
}

export const fetchLeagues = () => {
	return (dispatch, getState) => {

		const debug = !navigator.onLine //true

		if (debug) {
			return dispatch( fetchOfflineLeagueData() )
		}

		return dispatch( fetchUserLeagues() )
			.then( userLeagues => {
				if (!userLeagues) return

				let leagueInfo = {}
				Object.keys(userLeagues).forEach( id => {
					leagueInfo[id] = userLeagues[id].name
				})

				const defaultLeagueId = Object.keys(leagueInfo)[0]
				dispatch( receiveLeagues(leagueInfo) )
				return dispatch( changeActiveLeague( defaultLeagueId ))
			}
		)
	}
}

const fetchOfflineLeagueData = () => {
	return (dispatch, getState) => {

		let leagueInfo = {}
		Object.keys(defaultLeagues).forEach( id => {
			leagueInfo[id] = defaultLeagues[id].name
		})
		dispatch( receiveLeagues(leagueInfo) )
		const defaultLeagueId = Object.keys(defaultLeagues)[0]
		return dispatch( changeActiveLeague( defaultLeagueId ))
	}
}

const fetchUserLeagues = () => {
	return (dispatch, getState) => {
		const state = getState()

		const { uid, didInvalidate } = state.user

		const { fetching, didUnsynthesize } = state.leagues
		const shouldFetchUserLeagues = (uid && didUnsynthesize && !fetching)
		if (shouldFetchUserLeagues) {
			return dispatch( getLeagues('/users/' + uid + '/leagues') ) // Get League Data
				.then( userLeagues => userLeagues )
		} else {
			return Promise.resolve()
		}
	}
}

export const changeActiveLeague = (id) => {
	return (dispatch, getState) => {
		dispatch( updateActiveLeague(id) )
		return dispatch( fetchSettings(true) ).then( () => {
			return dispatch( fetchPlayers(true) ).then( () => {
				return dispatch( fetchTeams() )
			})
		})
	}
}

export const saveLeague = (id, name, settings) => {
	return (dispatch, getState) => {
		const leagueObject = {name, settings}
		return dispatch( createLeague(id, leagueObject) )
	}
}

export const createLeague = (id, leagueObject) => {
	return {type: CREATE_LEAGUE, payload: {id, leagueObject}}	
}

export const changeActiveLeagueName = (name) => {
	return {type: UPDATE_ACTIVE_LEAGUE_NAME, payload: {name}}	
}

export const receiveLeagues = (leagues) => {
	return {type: RECEIVE_LEAGUES, payload: {leagues}}
}

export const invalidateLeagues = () => {
	return { type: INVALIDATE_LEAGUES }
}

export const unsynthesizeLeagues = () => {
	return { type: UNSYNTHESIZE_LEAGUES }
}

export const loadLeaguesRequest = () => {
	return { type: loadLeaguesRequest }
}

export const updateActiveLeague = (id) => {
	return { type: UPDATE_ACTIVE_LEAGUE, payload: {id} }
}

const reducer = (state = initialState, action) => {
	const { payload } = action
	const { leagues, id, name } = (payload || {})
	const { activeLeague, data } = state


	switch (action.type) {
		case INVALIDATE_LEAGUES:
			return Object.assign({}, state, {
				didInvalidate: true
			});

		case UNSYNTHESIZE_LEAGUES:
			return Object.assign({}, state, {
				didUnsynthesize: true
			});

		case LOAD_LEAGUES_REQUEST:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case LOAD_LEAGUES_SUCCESS:
			return Object.assign({}, state, {
				fetching: false,
				forceReload: false
			});

		case LOAD_LEAGUES_ERROR:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: true
			});

		case RECEIVE_LEAGUES:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				didUnsynthesize: false,
				data: payload.leagues
			});

		case UPDATE_ACTIVE_LEAGUE:
			const activeLeagueName = data[id]

			return Object.assign({}, state, {
				activeLeague: id ? { id, name: activeLeagueName } : null
			});

		case UPDATE_ACTIVE_LEAGUE_NAME: 
			return Object.assign({}, state, {
				activeLeague: Object.assign({}, activeLeague, { name }),
				data: Object.assign({}, data, { [activeLeague.id]: name })
			})

		default:
			return state;
	}
}

export default reducer
export {
	LOAD_LEAGUES_REQUEST,
	INVALIDATE_LEAGUES,
	RECEIVE_LEAGUES,
	CREATE_LEAGUE,
	UPDATE_ACTIVE_LEAGUE,
	UPDATE_ACTIVE_LEAGUE_NAME
}
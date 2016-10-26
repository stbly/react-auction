/*
// TO DO //

~ Figure out if we need both didInvalidate and didUnsynthesize

///////////
*/

import fetch from 'isomorphic-fetch'

const LOAD_LEAGUES_REQUEST = 'leagues/LOAD_LEAGUES_REQUEST'
const LOAD_LEAGUES_SUCCESS = 'leagues/LOAD_LEAGUES_SUCCESS'
const LOAD_LEAGUES_ERROR = 'leagues/LOAD_LEAGUES_ERROR'
const RECEIVE_LEAGUES = 'players/RECEIVE_LEAGUES'
const INVALIDATE_LEAGUES = 'players/INVALIDATE_LEAGUES'
const UNSYNTHESIZE_LEAGUES = 'players/UNSYNTHESIZE_LEAGUES'
const UPDATE_ACTIVE_LEAGUE = 'players/UPDATE_ACTIVE_LEAGUE'
const UPDATE_ACTIVE_LEAGUE_NAME = 'players/UPDATE_ACTIVE_LEAGUE_NAME'

import { fetchSettings } from './settings'

let initialState = {
	fetching: false,
	didInvalidate: true,
	didUnsynthesize: true,
	forceReload: false,
	data: null
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
		return dispatch( fetchSettings(true) )
	}
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

	const { leagues, id, cost, value, team, notes, stat } = (payload || {})

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
				data: leagues
			});

		case UPDATE_ACTIVE_LEAGUE:
			const { data } = state
			const name = data[id]

			return Object.assign({}, state, {
				activeLeague:{ id, name}
			});

		case UPDATE_ACTIVE_LEAGUE_NAME: 
			const { activeLeague } = state
			const newName = payload.name
			console.log(newName)
			return Object.assign({}, state, {
				activeLeague: Object.assign({}, activeLeague, { name: newName })
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
	UPDATE_ACTIVE_LEAGUE,
	UPDATE_ACTIVE_LEAGUE_NAME
}
import update from 'immutability-helper';
import { defaultTeams } from '../../helpers/constants/defaultTeams'

let initialState = {
	fetching: false,
	activeTeam: null
}

const LOAD_TEAMS_REQUEST = 'teams/LOAD_TEAMS_REQUEST'
const LOAD_TEAMS_SUCCESS = 'teams/LOAD_TEAMS_SUCCESS'
const LOAD_TEAMS_ERROR = 'teams/LOAD_TEAMS_ERROR'

const RECEIVE_TEAMS = 'teams/RECEIVE_TEAMS'
const CHANGE_TEAM_NAME = 'teams/CHANGE_TEAM_NAME'
const CHANGE_ACTIVE_TEAM = 'teams/CHANGE_ACTIVE_TEAM'
const RECEIVE_TEAM_PLAYERS = 'teams/RECEIVE_TEAM_PLAYERS'
const REMOVE_ALL_PLAYERS = 'teams/REMOVE_ALL_PLAYERS'

const scrubTeamData = (teams) => {

	for (const id in teams) {
		if (teams.hasOwnProperty(id)) {
			if (teams[id].teams) {
				var newTeams = Object.keys(teams).map( key => teams[key])
				teams[id].teams = newTeams
			}
		}
	}

	return teams
}

export const getTeams = (endpoint) => {
	return {
		types: [LOAD_TEAMS_REQUEST, LOAD_TEAMS_SUCCESS, LOAD_TEAMS_ERROR ],
		endpoint
		// payload: { didUnsynthesize: !defaultTeams }
	}
}

const fetchOfflineTeamData = () => {
	return (dispatch, getState) => {
		const teams = scrubTeamData(defaultTeams)
		dispatch( receiveTeams(teams) )
		return Promise.resolve()
	}
}

export const fetchTeams = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { uid } = state.user
		const { id } = state.leagues.activeLeague

		const debug = !navigator.onLine //true

		if (debug) {
			return dispatch( fetchOfflineTeamData() )
		}

		return dispatch( getTeams('/users/' + uid + '/leagues/' + id + '/teams') )
			.then( teams => {
				if (!teams) return
				var scrubbedTeams = scrubTeamData(teams);
				return dispatch( receiveTeams( scrubbedTeams ) )
			}
		)
	}
}

export function addPlayerToTeam (playerId, teamId) {
	return (dispatch, getState) => {
		const players = (getState().teams.data[teamId].players || [])
		var newPlayers = update(players, {$push: [playerId]});
		dispatch( receiveTeamPlayers(teamId, newPlayers) )
		return dispatch( receiveTeams( getState().teams.data ) )
	}
}

export function removePlayerFromTeam (playerId, teamId) {
	return (dispatch, getState) => {
		const players = (getState().teams.data[teamId].players || [])
		const playerIndex = players.indexOf(playerId)
		var newPlayers = update(players, {$splice: [[playerIndex, 1]]});
		dispatch( receiveTeamPlayers(teamId, newPlayers) )
		return dispatch( receiveTeams( getState().teams.data ) )
	}
}

export function receiveTeams (teams) {
	return { type: RECEIVE_TEAMS, payload: {teams} }
}

export function changeTeamName (teamId, name) {
	console.log(teamId, name)
	return { type: CHANGE_TEAM_NAME, payload: {teamId, name} }
}

export function changeActiveTeam (teamId) {
	return { type: CHANGE_ACTIVE_TEAM, payload: {teamId} }
}

export function receiveTeamPlayers (teamId, players) {
	return { type: RECEIVE_TEAM_PLAYERS, payload: {teamId, players} }
}

export default function reducer (state = initialState, action) {
	const { payload } = action
	const { teamId, players, name } = (payload || {})
	const { data } = state
	let teamObject

	switch (action.type) {
		case LOAD_TEAMS_REQUEST:
			return Object.assign({}, state, {
				fetching: true
			});

		case RECEIVE_TEAMS:
			const activeTeam = state.activeTeam || Object.keys(payload.teams)[0]
			const newState = Object.assign({}, state, {
				fetching: false,
				activeTeam: activeTeam,
				data: payload.teams
			});
			return newState

		case RECEIVE_TEAM_PLAYERS:
			teamObject = data[teamId]

			return Object.assign({}, state, {
				didInvalidate: true,
				data: Object.assign({}, data, {
					[teamId]: Object.assign({}, teamObject, { players })
				})
			})

		case CHANGE_TEAM_NAME:
			teamObject = data[teamId]

			return Object.assign({}, state, {
				fetching: false,
				data: Object.assign({}, data, { 
					[teamId]: Object.assign({}, teamObject, { name })
				})
			});

		case CHANGE_ACTIVE_TEAM:
			return Object.assign({}, state, {
				activeTeam: teamId
			});

		default:
			return state;
	}
}

export {
	RECEIVE_TEAMS,
	CHANGE_TEAM_NAME,
	RECEIVE_TEAM_PLAYERS,
	REMOVE_ALL_PLAYERS
}
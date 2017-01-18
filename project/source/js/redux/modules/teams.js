
let initialState = {
	fetching: false
}

const LOAD_TEAMS_REQUEST = 'teams/LOAD_TEAMS_REQUEST'
const LOAD_TEAMS_SUCCESS = 'teams/LOAD_TEAMS_SUCCESS'
const LOAD_TEAMS_ERROR = 'teams/LOAD_TEAMS_ERROR'

const RECEIVE_TEAMS = 'teams/RECEIVE_TEAMS'
const CHANGE_TEAM_NAME = 'teams/CHANGE_TEAM_NAME'
const ADD_PLAYER_TO_TEAM = 'teams/ADD_PLAYER_TO_TEAM'

const scrubTeamData = (teams) => {
	for (const id in teams) {
		if (teams.hasOwnProperty(id)) {
			if (teams[id].teams) {
				var newPlayers = Object.keys(teams).map( key => teams[key])
				teams[id].teams = newPlayers
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

export const fetchTeams = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { uid } = state.user
		const { id } = state.leagues.activeLeague

		return dispatch( getTeams('/users/' + uid + '/leagues/' + id + '/teams') )
			.then( teams => {
				if (!teams) return
				var scrubbedTeams = scrubTeamData(teams);
				return dispatch( receiveTeams( scrubbedTeams ) )
			}
		)

	}
}

export function receiveTeams (teams) {
   return { type: RECEIVE_TEAMS, payload: {teams} }
}

export function changeTeamName (id, name) {
	return { type: CHANGE_TEAM_NAME, payload: {id, name} }
}

export function addPlayerToTeam (playerId, teamId) {
	return { type: ADD_PLAYER_TO_TEAM, payload: {playerId, teamId} }
}

export default function reducer (state = initialState, action) {
	const {payload} = action
	const { data } = state
	let teamObject

	switch (action.type) {
		case LOAD_TEAMS_REQUEST:
			return Object.assign({}, state, {
				fetching: true
			});

		case RECEIVE_TEAMS:
			const newState = Object.assign({}, state, {
				fetching: false,
				data: payload.teams
			});
			return newState

		case ADD_PLAYER_TO_TEAM:
			const { teamId, playerId } = payload
			teamObject = data[teamId]
			const players = teamObject.players || []
			players.push(playerId)
			console.log(teamId)
			return Object.assign({}, state, {
				didInvalidate: true,
				data: Object.assign({}, data, {
					[teamId]: Object.assign({}, teamObject, { players })
				})
			})

		case CHANGE_TEAM_NAME:
			const { id, name } = payload
			teamObject = data[id]

			return Object.assign({}, state, {
				fetching: false,
				data: Object.assign({}, data, { 
					[id]: Object.assign({}, teamObject, { name })
				})
			});

		default:
			return state;
	}
}

export {
	CHANGE_TEAM_NAME
}
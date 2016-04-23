
let initialState = {
	fetching: false,
	data: {
		"Birds of War": {
			"manager":"al"
		},
		"Come Sale Away": {
			"manager":"johnnymtp"
		},
		"Grumpy Cats": {
			"manager":"Angela"
		},
		"Hanumonster": {
			"manager":"Spencer"
		},
		"King Leonys": {
			"manager":"Wilen"
		},
		"King of Long Toss": {
			"manager":"ryano"
		},
		"Mighty Joe CY Young": {
			"manager":"tim"
		},
		"My Betts Against Yu": {
			"manager":"Joe"
		},
		"Seager/Buxton - GG": {
			"manager":"Cory Dowd"
		},
		"Sojo Good Its Scary": {
			"manager":"SamCommissioner"
		},
		"Such A Swihart": {
			"manager":"Andrew"
		},
		"Suzyns Semon Suckers": {
			"manager":"Matt Brundage"
		},
		"TeamToBeNamedLater": {
			"manager":"Taylor"
		},
		"Wade Boggs Style": {
			"manager":"Conrad"
		}
	}
}

export function requestTeams() {
	return { type: 'REQUEST_TEAMS' }
}

export function receiveTeams (teams) {
   return { type: 'RECEIVE_TEAMS', teams: teams }
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_TEAMS':
			return Object.assign({}, state, {
				fetching: true
			});

		case 'RECEIVE_TEAMS':
			return Object.assign({}, state, {
				fetching: false,
				data: action.teams
			});

		default:
			return state;
	}
}
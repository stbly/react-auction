
let initialState = {
	fetching: false,
	data: {
		numTeams: 14,
		teamSalary: 270,
		startingSalary: 270,
		battingPercentage: 70,
		rosterSpots: 24,
		numBatters: 13,
		// prices: [45,33,26,22,19,17,15,13,12,11,10,8,7,6,6,5,4,3,2,2,1,1,1,1]
	}
}

export function requestSettings() {
	return { type: 'REQUEST_SETTINGS' }
}

export function receiveSettings (settings) {
   return { type: 'RECEIVE_SETTINGS', settings: settings }
}

export function updateSetting (setting, value) {
	return { type: 'UPDATE_SETTING', payload: {setting, value}}
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_SETTINGS':
			return Object.assign({}, state, {
				fetching: true
			});

		case 'RECEIVE_SETTINGS':
			return Object.assign({}, state, {
				fetching: false,
				data: action.settings
			});

		case 'UPDATE_SETTING':
			var {setting, value} = action.payload,
				newData = Object.assign({}, state.data, {
					[setting]: value
				})

			return Object.assign({}, state, {
				data: newData
			})

		default:
			return state;
	}
}
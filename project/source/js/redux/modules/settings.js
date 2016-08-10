
let initialState = {
	fetching: false,
	didInvalidate: false,
	data: {
		numTeams: 14,
		teamSalary: 270,
		// startingSalary: 270,
		battingPercentage: 70,
		rosterSpots: 24,
		numBatters: 13,
		// prices: [45,33,26,22,19,17,15,13,12,11,10,8,7,6,6,5,4,3,2,2,1,1,1,1]
	}
}

export const INVALIDATE_SETTINGS = 'settings/INVALIDATE_SETTINGS'
export const REQUEST_SETTINGS = 'settings/REQUEST_SETTINGS'
export const RECEIVE_SETTINGS = 'settings/RECEIVE_SETTINGS'
export const UPDATE_SETTING = 'settings/UPDATE_SETTING'

export function changeSetting(setting, value) {
	return function (dispatch, getState) {
		dispatch( updateSetting(setting, value))
		const settings = getState().settings.data
		return dispatch( receiveSettings(settings) )
	}
}

export function invalidateSettings () {
	return { type: INVALIDATE_SETTINGS }
}

export function requestSettings() {
	return { type: REQUEST_SETTINGS }
}

export function receiveSettings (settings) {
	return { type: RECEIVE_SETTINGS, payload: {settings} }
}

export function updateSetting (setting, value) {
	return { type: UPDATE_SETTING, payload: {setting, value}}
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case REQUEST_SETTINGS:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case RECEIVE_SETTINGS:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.payload.settings
			});

		case UPDATE_SETTING:
			var {setting, value} = action.payload,
				newData = Object.assign({}, state.data, {
					[setting]: value
				})

			return Object.assign({}, state, {
				didInvalidate: true,
				data: newData
			})

		default:
			return state;
	}
}
import * as SettingsUtils from '../../helpers/SettingsUtils'
import { defaultSettings } from '../../helpers/constants.js'

let initialState = {
	fetching: false,
	didInvalidate: false,
	data: null
}

const scrubSettingsData = (settings) => {
	/*for (const id in settings) {
		if (settings.hasOwnProperty(id)) {
			if (settings[id].stats) {
				if (settings[id].stats.default) {
					const stats = settings[id].stats.default
					const newStats = {}

					for (const stat in stats) {
						if (stats.hasOwnProperty(stat)) {
							const val = stats[stat] || 0
							newStats[stat] = val
						}
					}

					settings[id].stats = newStats
				}
			}
		}
	}*/
	return settings
}

export const getSettings = (endpoint) => {
	return {
		types: [LOAD_SETTINGS_REQUEST, LOAD_SETTINGS_SUCCESS, LOAD_SETTINGS_ERROR ],
		endpoint
		// payload: { didUnsynthesize: !defaultSettings }
	}
}

export const fetchSettings = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { didInvalidate } = state.settings
		const debug = false

		if (debug) {
			return dispatch( fetchOfflineSettingData() )
		}

		return dispatch( fetchDefaultSettings() )
			.then( settings => dispatch( fetchUserSettings() )
				.then( userSettings => {
					const defaultSettings = settings || state.settings.data
					const synthesizedSettings = synthesizeSettingsData(defaultSettings, userSettings)
					return dispatch(receiveSettings(synthesizedSettings))
				}
			)
	    )
	}
}

const synthesizeSettingsData = (settingsData, userSettingsData=null) => {
	/*if (userSettingsData) {
		for (const userPlayerId in userSettingsData) {
			if (userSettingsData.hasOwnProperty(userPlayerId)) {

				const player = settingsData[userPlayerId]
				const userPlayer = userSettingsData[userPlayerId]

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
	}*/
	return settingsData
}

const fetchOfflineSettingData = () => {
	return (dispatch, getState) => {
		const settings = scrubSettingsData(defaultSettings)
		dispatch( receiveSettings(defaultSettings) )
		return Promise.resolve()
	}
}

const fetchDefaultSettings = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { data, fetching, forceReload } = state.settings
		const shouldFetchSettings = ((!data || forceReload) && !fetching)
		if (shouldFetchSettings) {
			return dispatch( getSettings('/settings') ) // Load default player data
				.then( settings => scrubSettingsData(settings) )
		} else {
			return Promise.resolve()
		}
	}
}

const fetchUserSettings = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { uid, didInvalidate } = state.user
		const { fetching, didUnsynthesize, leagueId } = state.settings
		const shouldFetchUserSettings = (uid && leagueId && didUnsynthesize && !fetching)
		// console.log('FETCH USER PLAYERS?',uid, didUnsynthesize, fetching)
		if (shouldFetchUserSettings) {
			return dispatch ( getSettings('/users/' + uid + '/leagues/' + leagueId) ) // Get Player Data
				.then( userSettings => userSettings )
		} else {
			return Promise.resolve()
		}
	}
}

export const INVALIDATE_SETTINGS = 'settings/INVALIDATE_SETTINGS'
export const REQUEST_SETTINGS = 'settings/REQUEST_SETTINGS'
export const RECEIVE_SETTINGS = 'settings/RECEIVE_SETTINGS'
export const UPDATE_SETTING = 'settings/UPDATE_SETTING'


export const changeSetting = (setting, value) => {
	return (dispatch, getState) => {
		dispatch( updateSetting(setting, value))
		const settings = getState().settings.data
		return dispatch( receiveSettings(settings) )
	}
}

export const invalidateSettings = () => {
	return { type: INVALIDATE_SETTINGS }
}

export const requestSettings = () => {
	return { type: REQUEST_SETTINGS }
}

export const receiveSettings  = (settings) => {
	return { type: RECEIVE_SETTINGS, payload: {settings} }
}

export const updateSetting  = (setting, value) => {
	return { type: UPDATE_SETTING, payload: {setting, value}}
}

const reducer = (state = initialState, action) => {

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

export default reducer
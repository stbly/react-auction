import * as SettingsUtils from '../../helpers/SettingsUtils'
import { defaultSettings } from '../../helpers/constants/defaultSettings'
import { 
	mergeDeep,
	endpointToObject } from '../../helpers/dataUtils'

import { settingsEndpoints } from '../../helpers/constants/settings'

let initialState = {
	fetching: false,
	didInvalidate: false,
	data: null
}

const LOAD_SETTINGS_REQUEST = 'players/LOAD_SETTINGS_REQUEST'
const LOAD_SETTINGS_SUCCESS = 'players/LOAD_SETTINGS_SUCCESS'
const LOAD_SETTINGS_ERROR = 'players/LOAD_SETTINGS_ERROR'

// Prune data from server to play nicely with the app
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

export const fetchSettings = (forceFetch=false) => {
	return (dispatch, getState) => {
		const state = getState()
		const debug = !navigator.onLine //true

		if (debug) {
			return dispatch( fetchOfflineSettingData() )
		}

		const { data, fetching } = state.settings

		const shouldFetchSettings = ((!data || forceFetch) && !fetching)

		if (shouldFetchSettings) { 
			return dispatch( fetchDefaultSettings() )
				.then( settings => dispatch( fetchUserSettings() )
					.then( userSettings => {
						const defaultSettings = settings || state.settings.data
						const synthesizedSettings = mergeDeep(defaultSettings, userSettings)
						return dispatch(receiveSettings(synthesizedSettings))
					}
				)
		    )
		} else {
			return Promise.resolve()
		}
	}
}

/*const synthesizeSettingsData = (settingsData, userSettingsData=null) => {
	let synthesizedSettings = mergeDeep(settingsData, userSettingsData)
	console.log('synthesizedSettings',settingsData,userSettingsData)
	return settingsData
}*/

const fetchOfflineSettingData = () => {
	return (dispatch, getState) => {
		const settings = scrubSettingsData(defaultSettings)
		dispatch( receiveSettings(defaultSettings) )
		return Promise.resolve()
	}
}

const fetchDefaultSettings = () => {
	return (dispatch, getState) => {
		return dispatch( getSettings('/defaults/settings') ) // Load default player data
			.then( settings => {
				const scrubbedSettings = scrubSettingsData(settings)
				dispatch( receiveDefaultSettings(scrubbedSettings) )
				return scrubbedSettings
			})
	}
}

const fetchUserSettings = () => {
	return (dispatch, getState) => {
		const state = getState()
		const { fetching } = state.settings
		const { uid } = state.user
		const { activeLeague } = state.leagues
		const activeLeagueId = activeLeague ? activeLeague.id : null
		const shouldFetchUserSettings = (activeLeagueId && uid && !fetching)

		if (shouldFetchUserSettings) {
			return dispatch ( getSettings('/users/' + uid + '/leagues/' + activeLeagueId + '/settings/') ) // Get Settings Data
				.then( userSettings => userSettings )
		} else {
			return Promise.resolve()
		}
	}
}

export const INVALIDATE_SETTINGS = 'settings/INVALIDATE_SETTINGS'
export const REQUEST_SETTINGS = 'settings/REQUEST_SETTINGS'
export const RECEIVE_SETTINGS = 'settings/RECEIVE_SETTINGS'
export const RECEIVE_DEFAULT_SETTINGS = 'settings/RECEIVE_DEFAULT_SETTINGS'
export const UPDATE_SETTING = 'settings/UPDATE_SETTING'

export const changeSetting = (setting, value, endpoint) => {
	return (dispatch, getState) => {
		dispatch( invalidateSettings() )
		dispatch( updateSetting(setting, value, endpoint))
		const settings = getState().settings.data
		const path = endpoint || settingsEndpoints[setting]
		const newData = endpointToObject(path, value)
		const settingsCopy = Object.assign({}, settings)
		const mergedData = mergeDeep(settingsCopy, newData)
		return dispatch( receiveSettings(mergedData) )
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

export const receiveDefaultSettings  = (settings) => {
	return { type: RECEIVE_DEFAULT_SETTINGS, payload: {settings} }
}

export const updateSetting  = (setting, value, endpoint) => {
	return { type: UPDATE_SETTING, payload: {setting, value, endpoint}}
}

const reducer = (state = initialState, action) => {

	switch (action.type) {
		case REQUEST_SETTINGS:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case LOAD_SETTINGS_REQUEST:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case LOAD_SETTINGS_SUCCESS:
			return Object.assign({}, state, {
				fetching: false
			});

		case LOAD_SETTINGS_ERROR:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: true
			});

		case RECEIVE_SETTINGS:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.payload.settings
			});

		case RECEIVE_DEFAULT_SETTINGS:
			return Object.assign({}, state, {
				defaults: action.payload.settings
			});
		
		case INVALIDATE_SETTINGS:
			return Object.assign({}, state, {
				didInvalidate: true
			})

		default:
			return state;
	}
}

export default reducer
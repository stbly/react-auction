import firebase from 'firebase'
import { firebaseData } from './api'

import { settingsEndpoints } from '../../helpers/constants/settings'

import {
	UPDATE_PLAYER_STAT,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES } from '../modules/players'

import {
	UPDATE_SETTING } from '../modules/settings'

import {
	UPDATE_ACTIVE_LEAGUE_NAME } from '../modules/leagues'

// TODO: Refactor this so that it takes advantage of the api middleware; not sure if firebase middleware is needed

const getUserRef = () => {
	return firebaseData.ref().child("users")
}

const updateFirebaseUserPlayerStat = (state, action) => {
	const {id, stat, value} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'

	usersRef.update({
		[path]: Number(value)
	})
}

const updateFirebaseUserPlayerDraftPrice = (state, action) => {
	const {id, cost} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/cost/'

	let costToSend = Number(cost)
	costToSend = costToSend > 0 ? costToSend : null

	usersRef.update({
		[path]: costToSend
	})
}

const updateFirebaseUserPlayerFavorited = (state, action) => {
	const {id} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/isFavorited/'

	const isFavorited = state.players.data[id].isFavorited ? null : true

	usersRef.update({
		[path]: isFavorited
	})
}

const updateFirebaseUserPlayerNotes = (state, action) => {
	const {id, notes} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/notes/'

	const notesToServer = notes.length > 0 ? notes : null

	usersRef.update({
		[path]: notesToServer
	})
}

const updateFirebaseUserSetting = (state, action) => {
	const { activeLeague } = state.leagues
	const { id } = activeLeague
	if (!id) return

	const {setting, value} = action.payload
	const usersRef = getUserRef()
	const endpoint = settingsEndpoints[setting]
	const path = state.user.uid + '/leagues/' + id + '/settings/' + endpoint
	usersRef.update({
		[path]: value
	})
}

const updateFirebaseLeagueName = (state, action) => {
	console.log('updateFirebaseLeagueName')
	const { activeLeague } = state.leagues
	const { id } = activeLeague
	if (!id) return

	const { name } = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/leagues/' + id + '/name/'
		console.log(path)

	usersRef.update({
		[path]: name
	})
}

const actionHandlers = {
	[UPDATE_PLAYER_STAT]: updateFirebaseUserPlayerStat,
	[UPDATE_PLAYER_COST]: updateFirebaseUserPlayerDraftPrice,
	[UPDATE_PLAYER_FAVORITED]: updateFirebaseUserPlayerFavorited,
	[UPDATE_PLAYER_NOTES]: updateFirebaseUserPlayerNotes,
	[UPDATE_SETTING]: updateFirebaseUserSetting,
	[UPDATE_ACTIVE_LEAGUE_NAME]: updateFirebaseLeagueName	
}

export default function firebaseMiddleware({ dispatch, getState }) {
	return next => action => {
		const state = getState()

		const handler = actionHandlers[action.type]
		if (handler && state.user.uid) {
			handler(state, action)
		}

		return next(action)
	}
}
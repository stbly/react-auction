import firebase from 'firebase'
import { firebaseData } from './api'

import {
	UPDATE_PLAYER_STAT,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES } from '../modules/players'

// TODO: Refactor this so that it takes advantage of the api middleware; not sure if firebase middleware is needed

const updateFirebaseUserPlayerStat = (state, action) => {
	const {id, stat, value} = action.payload
	const usersRef = firebaseData.ref().child("users")
	const path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'

	usersRef.update({
		[path]: Number(value)
	})
}

const updateFirebaseUserPlayerDraftPrice = (state, action) => {
	const {id, cost} = action.payload
	const usersRef = firebaseData.ref().child("users")
	const path = state.user.uid + '/players/' + id + '/cost/'

	let costToSend = Number(cost)
	costToSend = costToSend > 0 ? costToSend : null

	usersRef.update({
		[path]: costToSend
	})
}

const updateFirebaseUserPlayerFavorited = (state, action) => {
	const {id} = action.payload
	const usersRef = firebaseData.ref().child("users")
	const path = state.user.uid + '/players/' + id + '/isFavorited/'

	const isFavorited = state.players.data[id].isFavorited ? null : true

	usersRef.update({
		[path]: isFavorited
	})
}

const updateFirebaseUserPlayerNotes = (state, action) => {
	const {id, notes} = action.payload
	const usersRef = firebaseData.ref().child("users")
	const path = state.user.uid + '/players/' + id + '/notes/'

	const notesToServer = notes.length > 0 ? notes : null

	usersRef.update({
		[path]: notesToServer
	})
}


export default function firebaseMiddleware({ dispatch, getState }) {
	return next => action => {
		const state = getState()
		switch (action.type) {

			case UPDATE_PLAYER_STAT:
				if (state.user.uid) {
					updateFirebaseUserPlayerStat(state, action)
				}
				break

			case UPDATE_PLAYER_COST:
				if (state.user.uid) {
					updateFirebaseUserPlayerDraftPrice(state, action)
				}
				break

			case UPDATE_PLAYER_FAVORITED:
				if (state.user.uid) {
					updateFirebaseUserPlayerFavorited(state, action)
				}
				break

			case UPDATE_PLAYER_NOTES:
				if (state.user.uid) {
					updateFirebaseUserPlayerNotes(state, action)
				}
				break
		}

		return next(action)
	}
}
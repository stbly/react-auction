import firebase from 'firebase'
import { firebaseData } from './api'

import {
	UPDATE_PLAYER_STAT,
	UPDATE_PLAYER_COST } from '../modules/players'

const updateFirebaseUserPlayerStat = (state, action) => {
	console.log(action)
	var {id, stat, value} = action.payload,
		usersRef = firebaseData.ref().child("users"),
		path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'

	usersRef.update({
		[path]: Number(value)
	})

	// TODO: dispatch event on firebase update callback; don't update app if data is the same
}

const updateFirebaseUserPlayerDraftPrice = (state, action) => {
	var {id, cost} = action.payload,
		usersRef = firebaseData.ref().child("users"),
		path = state.user.uid + '/players/' + id + '/cost/'

	usersRef.update({
		[path]: Number(cost)
	})

	// TODO: dispatch event on firebase update callback; don't update app if data is the same
}

export default function firebaseMiddleware({ dispatch, getState }) {
	return next => action => {
		const state = getState()
		switch (action.type) {

			case UPDATE_PLAYER_STAT:
				// /users/50fZ5hfC3mWxrNcIlHhhXrR0Rxp2/players/1/stats/
				if (state.user.uid) {
					updateFirebaseUserPlayerStat(state, action)
				}
				break

			case UPDATE_PLAYER_COST:
				// /users/50fZ5hfC3mWxrNcIlHhhXrR0Rxp2/players/1/stats/
				if (state.user.uid) {
					updateFirebaseUserPlayerDraftPrice(state, action)
				}
				break
		}

		return next(action)
	}
}
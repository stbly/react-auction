import firebase from 'firebase'
import { firebaseData } from './api'

import { UPDATE_PLAYER_STAT } from '../modules/players'

const updateFirebaseUserPlayerData = (state, action) => {
	console.log(action)
	var {id, stat, value} = action.payload,
		usersRef = firebaseData.ref().child("users"),
		path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'

	usersRef.update({
		[path]: Number(value)
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
					updateFirebaseUserPlayerData(state, action)
				}
				break
		}

		return next(action)
	}
}
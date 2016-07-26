import { firebaseRef } from '../modules/user'
import { UPDATE_PLAYER_STAT } from '../modules/players'
import {
	ATTEMPTING_LOGIN,
	ATTEMPTING_LOGOUT,
	LOGIN_USER,
	LOGOUT_USER,
	DISPLAY_ERROR } from '../modules/user'

const updateFirebaseUserPlayerData = (state, action) => {
	var {id, stat, value} = action.props,
		usersRef = firebaseRef.child("users"),
		path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'

	usersRef.update({
		[path]: Number(value)
	})

	// TODO: dispatch event on firebase update callback; don't update app if data is the same
}

export default function firebaseMiddleware({ dispatch, getState }) {
	return next => action => {

		const { type } = action
		switch (type) {
			case UPDATE_PLAYER_STAT: {
				// /users/50fZ5hfC3mWxrNcIlHhhXrR0Rxp2/players/1/stats/
				var state = getState();
				if (state.user.uid) {
					updateFirebaseUserPlayerData(state, action)
				}
				break;
			}
			case LOGIN_USER: {
			}
		}

		return next(action)
	}
}
// code derived from @github Krawaller from http://blog.krawaller.se/posts/a-react-redux-firebase-app-with-authentication/

import firebase from 'firebase'
import { firebaseRef } from '../middleware/firebase'
import {
	fetchPlayers,
	forceLoadPlayers,
	unsynthesizePlayers } from './players'

import {
	fetchLeagues } from './leagues'

export const AWAITING_AUTH_RESPONSE = 'user/status/AWAITING_AUTH_RESPONSE'
export const ANONYMOUS = 'user/status/ANONYMOUS'
export const LOGGED_IN = 'user/status/LOGGED_IN'

const ATTEMPTING_LOGIN = 'user/actions/ATTEMPTING_LOGIN'
const ATTEMPTING_LOGOUT = 'user/actions/ATTEMPTING_LOGOUT'
const LOGIN_USER = 'user/actions/LOGIN_USER'
const LOGOUT_USER = 'user/actions/LOGOUT_USER'
const DISPLAY_ERROR = 'user/actions/DISPLAY_ERROR'

export const startListeningToAuth = () => {
	return (dispatch,getState) => {
		console.log('startListeningToAuth()')
		firebase.auth().onAuthStateChanged( user => {
			const state = getState()
			console.log('onAuthStateChanged')
			if (user) {
				const {uid, displayName, email} = user
				const username = displayName || email
				/*firebaseRef.on('child_changed', (childSnapshot, prevChildKey) {
					dispatch( childUpdated(childSnapshot, prevChildKey) )
				})*/
				return dispatch( loginUser(uid, username) )
			} else {
				// No user is signed in.
				if (state.auth) {
					if (auth.currently !== "ANONYMOUS")
						return dispatch( attemptLogout() )
				}
			}
		});
		return Promise.resolve()
	}
}

export const childUpdated = (childSnapshot, prevChildKey) => {
	return (dispatch,getState) => {
		console.log('child updated!')
	}
}

export const attemptLogin = (username, password) => {
	return (dispatch,getState) => {
		dispatch( attemptingLogin() )

		firebase.auth().signInWithEmailAndPassword(username, password).catch((error) => {
			console.log('SIGN IN ERROR',error)
			const errorCode = error.code;
			const errorMessage = error.message;
			dispatch( displayError(error.message) )
		});
	}
}

export const attemptLogout = () => {
	return (dispatch,getState) => {
		dispatch( attemptingLogout() )
		firebase.auth().signOut()
			.then(
				() => {
					return dispatch( logoutUser() )
				},
				error => {}
			);
	}
}


export const loginUser = (uid, username) => {
	return (dispatch,getState) => {

		dispatch( unsynthesizePlayers() )
		dispatch( userLoggedIn(uid, username) )
		dispatch( fetchLeagues () )
		return dispatch( fetchPlayers() )
	}
}

export const logoutUser = () => {
	return (dispatch,getState) => {

		dispatch( forceLoadPlayers() )
		dispatch( userLoggedOut() )
		dispatch( fetchLeagues () )
		return dispatch( fetchPlayers() )
	}
}

export const attemptingLogin = (uid, username) => {
	return { type: ATTEMPTING_LOGIN }
}

export const attemptingLogout = (uid, username) => {
	return { type: ATTEMPTING_LOGOUT }
}

export const userLoggedIn = (uid, username) => {
	return { type: LOGIN_USER, payload: {uid, username} }
}

export const userLoggedOut = () => {
	return { type: LOGOUT_USER }
}

export const displayError = (error) => {
	return { type: DISPLAY_ERROR, payload: {error} }
}


const reducer = (state = {}, action) => {

	switch (action.type) {
		case ATTEMPTING_LOGIN:
			state = Object.assign({}, state, {
				status: AWAITING_AUTH_RESPONSE,
				username: "guest",
				uid: null,
				error: null
			})
			return state
		case ATTEMPTING_LOGOUT:
			state = Object.assign({}, state, {
				status: AWAITING_AUTH_RESPONSE,
				error: null
			})
			return state
		case LOGOUT_USER:
			state = Object.assign({}, state, {
				status: ANONYMOUS,
				username: "guest",
				error: null,
				uid: null
			})
			return state
		case LOGIN_USER:
			const {username, uid} = action.payload
			state = Object.assign({}, state, {
				status: LOGGED_IN,
				error: null,
				username,
				uid,
			})
			return state
		case DISPLAY_ERROR:
			const {error} = action.payload
			state = Object.assign({}, state, {
				status: ANONYMOUS,
				error
			})
			return state
		default: return state
	}
}
export default reducer
export {
	ATTEMPTING_LOGIN,
	ATTEMPTING_LOGOUT,
	LOGIN_USER,
	LOGOUT_USER,
	DISPLAY_ERROR
}
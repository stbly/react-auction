// code derived from @github Krawaller from http://blog.krawaller.se/posts/a-react-redux-firebase-app-with-authentication/

import firebase from 'firebase'
import { firebaseRef } from '../middleware/firebase'
import {
	fetchPlayers,
	forceLoadPlayers,
	unsynthesizePlayers } from './players'

import computePlayerValues from '../../helpers/PlayerValueUtils'

const ATTEMPTING_LOGIN = 'user/ATTEMPTING_LOGIN'
const ATTEMPTING_LOGOUT = 'user/ATTEMPTING_LOGOUT'
const LOGIN_USER = 'user/LOGIN_USER'
const LOGOUT_USER = 'user/LOGOUT_USER'
const DISPLAY_ERROR = 'user/DISPLAY_ERROR'


export function startListeningToAuth () {
	return function (dispatch,getState) {
		firebase.auth().onAuthStateChanged( user => {
			const state = getState()
			console.log('onAuthStateChanged')
			if (user) {
				const {uid, displayName, email} = user
				const username = displayName || email
				/*firebaseRef.on('child_changed', function(childSnapshot, prevChildKey) {
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

export function childUpdated (childSnapshot, prevChildKey) {
	return function(dispatch,getState){
		console.log('child updated!')
	}
}

export function attemptLogin (username, password) {
	return function(dispatch,getState){
		dispatch( attemptingLogin() )

		firebase.auth().signInWithEmailAndPassword('conorbritain@gmail.com', 'w@deb0ggsstyl3').catch(function(error) {
		// firebase.auth().signInWithEmailAndPassword( username, password ).catch(function(error) {
			console.log('ERROR')
			var errorCode = error.code;
			var errorMessage = error.message;
		});
	}
}

export function attemptLogout () {
	return function(dispatch,getState){
		dispatch( attemptingLogout() )
		firebase.auth().signOut()
			.then(
				() => {
				/*firebaseRef.off('child_changed', function(childSnapshot, prevChildKey) {
					dispatch( childUpdated(childSnapshot, prevChildKey) )
				})*/
					return dispatch( logoutUser() )
				},
				error => {}
			);
	}
}


export function loginUser (uid, username) {
	return function(dispatch,getState){
		dispatch( unsynthesizePlayers() )
		dispatch( userLoggedIn(uid, username) )
		return dispatch( fetchPlayers() )
	}
}

export function logoutUser () {
	return function(dispatch,getState){
		console.log('logoutUser')
		dispatch( forceLoadPlayers() )
		dispatch( userLoggedOut() )
		return dispatch( fetchPlayers() )
	}
}

export function attemptingLogin (uid, username) {
	return { type: ATTEMPTING_LOGIN }
}

export function attemptingLogout (uid, username) {
	return { type: ATTEMPTING_LOGOUT }
}

export function userLoggedIn (uid, username) {
	console.log('userLoggedIn')
	return { type: LOGIN_USER, payload: {uid, username} }
}

export function userLoggedOut () {
	return { type: LOGOUT_USER }
}

export function displayError (error) {
	return { type: DISPLAY_ERROR, payload: {error} }
}

function reducer (state = {}, action) {

	switch (action.type) {
		case ATTEMPTING_LOGIN:
			state = Object.assign({}, state, {
				currently: "AWAITING_AUTH_RESPONSE",
				username: "guest",
				uid: null
			})
			return state
		case ATTEMPTING_LOGOUT:
			console.log('ATTEMPTING_LOGOUT')
			state = Object.assign({}, state, {
				currently: "AWAITING_AUTH_RESPONSE"
			})
			return state
		case LOGOUT_USER:
			console.log('LOUOUT_USER')
			state = Object.assign({}, state, {
				currently: "ANONYMOUS",
				username: "guest",
				uid: null
			})
			return state
		case LOGIN_USER:
			console.log('LOGIN_USER')
			var {username, uid} = action.payload
			state = Object.assign({}, state, {
				currently: "LOGGED_IN",
				username,
				uid
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
// code derived from @github Krawaller from http://blog.krawaller.se/posts/a-react-redux-firebase-app-with-authentication/

import firebase from 'firebase'
import {firebaseRef} from '../middleware/firebase'
import { fetchPlayersIfNeeded } from './players'

import { getCustomValues, invalidatePlayers, receivePlayers } from './players'
import computePlayerValues from '../../helpers/PlayerValueUtils'


const ATTEMPTING_LOGIN = 'user/ATTEMPTING_LOGIN'
const ATTEMPTING_LOGOUT = 'user/ATTEMPTING_LOGOUT'
const LOGIN_USER = 'user/LOGIN_USER'
const LOGOUT_USER = 'user/LOGOUT_USER'
const DISPLAY_ERROR = 'user/DISPLAY_ERROR'


export function startListeningToAuth () {
	return function (dispatch,getState) {
		firebase.auth().onAuthStateChanged(function(user) {

			console.log('onAuthStateChanged')
			if (user) {
				// User is signed in.

				console.log('loginuser',user)
				var uid = user.uid,
					username =  user.displayName || user.email

				/*firebaseRef.on('child_changed', function(childSnapshot, prevChildKey) {
					dispatch( childUpdated(childSnapshot, prevChildKey) )
				})*/

				console.log('dispatchLogin')

				dispatch( userLoggedIn(uid, username) )
/*
					var currentPlayerData = Array.toObject(getState().players.data)
					console.log('currentPlayerData?',currentPlayerData)
					if (currentPlayerData) {
						dispatch( invalidatePlayers() )
						synthesizePlayerData(currentPlayerData).then( synthesizedPlayers => {
							dispatch( receivePlayers(computePlayerValues(synthesizedPlayers, getState())))
						})
					}*/

			} else {
				// No user is signed in.
				if (getState().auth.currently !== "ANONYMOUS"){

				console.log('logoutUser')
					dispatch( logoutUser() )
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
			// Handle Errors here.
			console.log('ERROR')
			var errorCode = error.code;
			var errorMessage = error.message;
		});
	}
}

export function logoutUser () {
	return function(dispatch,getState){
		dispatch( attemptingLogout() )
		firebase.auth().signOut().then(function() {

			firebaseRef.off('child_changed', function(childSnapshot, prevChildKey) {
				dispatch( childUpdated(childSnapshot, prevChildKey) )
			})

			dispatch( userLoggedOut() )
		}, function(error) {
		});
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
			console.log('LOUGOUT_USER')
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
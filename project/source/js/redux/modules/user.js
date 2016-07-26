// code derived from @github Krawaller from http://blog.krawaller.se/posts/a-react-redux-firebase-app-with-authentication/

import { getCustomValues, invalidatePlayers } from './players'

const ATTEMPTING_LOGIN = 'user/ATTEMPTING_LOGIN'
const ATTEMPTING_LOGOUT = 'user/ATTEMPTING_LOGOUT'
const LOGIN_USER = 'user/LOGIN_USER'
const LOGOUT_USER = 'user/LOGOUT_USER'
const DISPLAY_ERROR = 'user/DISPLAY_ERROR'

import firebase from 'firebase'
const config = {
	apiKey: "AIzaSyB-BtZ6B1pQe5hJrIEQFVmprg7kuvroSfo",
	authDomain: "auction-values-472d6.firebaseapp.com",
	databaseURL: "https://auction-values-472d6.firebaseio.com",
	storageBucket: "auction-values-472d6.appspot.com",
};

firebase.initializeApp(config);
export const firebaseRef = firebase.database().ref();

export function fetchPlayerData () {
	return function (dispatch, getState) {

		return firebase.database().ref('/players').once('value').then( snapshot => {
			var players = snapshot.val()
			// firebase.database().ref('/players').once('value').then

			for (var id in players) {
				if (players.hasOwnProperty(id)) {
					var statsExist = players[id].stats
					if (statsExist) {
						players[id].stats = players[id].stats.default
					}
				}
			}

			return synthesizePlayerData(players).then( synthesizedPlayers => {
				return synthesizedPlayers
			})
		})
	}
}

export function synthesizePlayerData (players) {
	var currentUser = firebase.auth().currentUser

	if (currentUser) {
		return firebase.database().ref('/users/' + currentUser.uid).once('value').then( snapshot => {
			var userPlayers = snapshot.val().players;
			console.log('----', userPlayers)
			for (var userPlayerId in userPlayers) {
				if (userPlayers.hasOwnProperty(userPlayerId)) {
					var userPlayerStats = userPlayers[userPlayerId].stats
					if (userPlayerStats) {
						var defaultStats = players[userPlayerId].stats
						players[userPlayerId].stats = Object.assign({}, defaultStats, userPlayerStats)

						console.log('????',players[userPlayerId])
					}
				}
			}

			return players
		})
	}

	return Promise.resolve(players)
}

export function startListeningToAuth () {
	return function (dispatch,getState) {
		firebase.auth().onAuthStateChanged(function(user) {

			console.log('onAuthStateChanged')
			if (user) {
				// User is signed in.
				var uid = user.uid,
					username =  user.displayName || user.email

				firebaseRef.on('child_changed', function(childSnapshot, prevChildKey) {
					dispatch( childUpdated(childSnapshot, prevChildKey) )
				})

				dispatch( userLoggedIn(uid, username) )

				var currentPlayerData = Object.toObject(getState().players.data)
				console.log('currentPlayerData?',currentPlayerData)
				if (currentPlayerData) {
					console.log('!!!!');
					dispatch( invalidatePlayers() )
					synthesizePlayerData(currentPlayerData).then( synthesizedPlayers => {
						console.log('we have synthesis',synthesizedPlayers)
						getCustomValues(synthesizedPlayers)
					})
				}

			} else {
				// No user is signed in.
				if (getState().auth.currently !== "ANONYMOUS"){
					dispatch( logoutUser() )
				}
			}
		});
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
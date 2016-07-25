// code derived from @github Krawaller from http://blog.krawaller.se/posts/a-react-redux-firebase-app-with-authentication/

import firebase from 'firebase'

var config = {
	apiKey: "AIzaSyB-BtZ6B1pQe5hJrIEQFVmprg7kuvroSfo",
	authDomain: "auction-values-472d6.firebaseapp.com",
	databaseURL: "https://auction-values-472d6.firebaseio.com",
	storageBucket: "auction-values-472d6.appspot.com",
};

firebase.initializeApp(config);
var firebaseRef = firebase.database().ref();

var initialState = {
	players: null,
	user: null
}

export function attemptingLogin (uid, username) {
	return { type: 'ATTEMPTING_LOGIN' }
}

export function attemptingLogout (uid, username) {
	return { type: 'ATTEMPTING_LOGOUT' }
}

export function userLoggedIn (uid, username) {
	return { type: 'LOGIN_USER', payload: {uid, username} }
}

export function userLoggedOut () {
	return { type: 'LOGOUT_USER' }
}

export function displayError (error) {
	return { type: 'DISPLAY_ERROR', payload: {error} }
}

	// called at app start

export function fetchPlayerData () {
	return function (dispatch, getState) {
		console.log(firebase.database().ref('/players').once('value'))
		return firebase.database().ref('/players').once('value').then( snapshot => snapshot.val() )
	}
}

export function synthesizePlayerData (players) {
	// var userPlayers = state.user.players
	// console.log('=====synthesizePlayerData')
	// var playerArray = Object.toArray(players);
	// console.log('=====done synthesis')
	return function (dispatch, getState) {
		for (var id in players) {
			if (players.hasOwnProperty(id)) {
				var statsExist = players[id].stats
				if (statsExist) {
					players[id].stats = players[id].stats.default
				}
			}
		}
		return Promise.resolve(players)
	}
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

		// firebase.auth().signInWithEmailAndPassword('conorbritain@gmail.com', 'w@deb0ggsstyl3').catch(function(error) {
		firebase.auth().signInWithEmailAndPassword( username, password ).catch(function(error) {
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


export default function reducer (state = initialState, action) {

	switch (action.type) {
		case "ATTEMPTING_LOGIN":
			state.user = Object.assign({}, state.user, {
				currently: "AWAITING_AUTH_RESPONSE",
				username: "guest",
				uid: null
			})
			return state
		case 'UPDATE_PLAYER_STAT': {
			// /users/50fZ5hfC3mWxrNcIlHhhXrR0Rxp2/players/1/stats/
			var {id, stat, value} = action.props,
				usersRef = firebaseRef.child("users"),
				path = state.uid + '/players/' + id + '/stats/' + stat + '/'

			usersRef.update({
				[path]: Number(value)
			})

			return state
		}
		case "ATTEMPTING_LOGOUT":
			state.user = Object.assign({}, state.user, {
				currently: "AWAITING_AUTH_RESPONSE"
			})
			return state
		case "LOGOUT_USER":
			state.user = Object.assign({}, state.user, {
				currently: "ANONYMOUS",
				username: "guest",
				uid: null
			})
			return state
		case "LOGIN_USER":
			var {username, uid} = action.payload
			state.user = Object.assign({}, state.user, {
				currently: "LOGGED_IN",
				username,
				uid
			})
			return state
		default: return state
	}
}

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
	currently: "ANONYMOUS",
	username: null,
	uid: null
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
	return { type: 'LOGOUT' }
}

export function displayError (error) {
	return { type: 'DISPLAY_ERROR', payload: {error} }
}

	// called at app start
export function startListeningToAuth () {
	return function(dispatch,getState){
		firebase.auth().onAuthStateChanged(function(user) {

			console.log('onAuthStateChanged')
			if (user) {
				// User is signed in.
				var uid = user.uid,
					username =  user.displayName || user.email
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

export function attemptLogin () {
	return function(dispatch,getState){
		dispatch( attemptingLogin() )

		firebase.auth().signInWithEmailAndPassword('conorbritain@gmail.com', 'w@deb0ggsstyl3').catch(function(error) {
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
			dispatch( userLoggedOut() )
		}, function(error) {
		});
	}
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case "ATTEMPTING_LOGIN":
			return {
				currently: "AWAITING_AUTH_RESPONSE",
				username: "guest",
				uid: null
			}
		case 'UPDATE_PLAYER_STAT': {

		}
		case "ATTEMPTING_LOGOUT":
			return Object.assign({}, state, {
				currently: "AWAITING_AUTH_RESPONSE"
			})
		case "LOGOUT":
			return {
				currently: "ANONYMOUS",
				username: "guest",
				uid: null
			}
		case "LOGIN_USER":
			var {username, uid} = action.payload
			return {
				currently: "LOGGED_IN",
				username,
				uid
			}
		default: return state
	}
}

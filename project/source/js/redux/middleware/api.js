import firebase from 'firebase'
const config = {
	apiKey: "AIzaSyB-BtZ6B1pQe5hJrIEQFVmprg7kuvroSfo",
	authDomain: "auction-values-472d6.firebaseapp.com",
	databaseURL: "https://auction-values-472d6.firebaseio.com",
	storageBucket: "auction-values-472d6.appspot.com",
};

firebase.initializeApp(config);
export const firebaseData = firebase.database()
export const firebaseRef = firebaseData.ref();

const apiMiddleware = ({ dispatch, getState }) => {
	return next => action => {
		const state = getState()
		const { types, endpoint, payload } = action
		if (types) {

		    const [ requestAction, successAction, failureAction ] = types

			dispatch( Object.assign({}, payload, {
				type: requestAction
			}))

			return firebaseData.ref(endpoint).once('value')
				.then(
					res => {
						dispatch(Object.assign({}, payload, {
							type: successAction
						}))
						return res.val()
					},
					error => {
						// TODO: Handle Error
						dispatch(Object.assign({}, payload, {
							error,
							type: failureAction
						}))
					}
				)
		}

		return next(action)
	}
}

export default apiMiddleware
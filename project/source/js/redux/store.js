import thunkMiddleware from 'redux-thunk'
import apiMiddlware from './middleware/api'
import firebaseMiddleware from './middleware/firebase'
import valuationMiddlware from './middleware/valuation'
import { createStore, applyMiddleware } from 'redux'
import { Router, Route, browserHistory } from 'react-router'
import { routeReducer, syncHistory } from 'react-router-redux'
import rootReducer from './modules'

export default function configureStore(initialState) {
    const store = createStore(
    	rootReducer,
    	applyMiddleware(
			thunkMiddleware, // lets us dispatch() functions
			apiMiddlware,
			firebaseMiddleware,
			valuationMiddlware
		)
    )
    return store
}

import thunkMiddleware from 'redux-thunk'
import apiMiddlware from './middleware/api'
import firebaseMiddleware from './middleware/firebase'
import valuationMiddlware from './middleware/valuation'
import tierMiddleware from './middleware/tiers'
import statMiddleware from './middleware/stat'
import { createStore, applyMiddleware } from 'redux'
import { Router, Route, browserHistory } from 'react-router'
import { routeReducer, syncHistory } from 'react-router-redux'
import rootReducer from './modules'

const configureStore = (initialState) => {
    const store = createStore(
    	rootReducer,
    	applyMiddleware(
			thunkMiddleware, // lets us dispatch() functions
			apiMiddlware,
			firebaseMiddleware,
			statMiddleware,
			valuationMiddlware,
			tierMiddleware
		)
    )
    return store
}

export default configureStore
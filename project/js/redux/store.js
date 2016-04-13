import { createStore, combineReducers } from 'redux'
import { Router, Route, browserHistory } from 'react-router'
import { routeReducer, syncHistory } from 'react-router-redux'
import rootReducer from './modules'

export default function configureStore(initialState) {
    const store = createStore(rootReducer)
    return store
}

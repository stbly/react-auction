import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import user from './user'
import players from './players'
import settings from './settings'
import teams from './teams'

const rootReducer = combineReducers({
	user,
    players,
    // activePlayer,
    settings,
    teams,
    routing: routerReducer
})

export default rootReducer
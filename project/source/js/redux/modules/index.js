import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import user from './user'
import leagues from './leagues'
import settings from './settings'
import teams from './teams'
import players from './players'

const rootReducer = combineReducers({
	user,
	leagues,
    players,
    // activePlayer,
    settings,
    teams,
    routing: routerReducer
})

export default rootReducer
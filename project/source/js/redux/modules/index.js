import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import user from './user'
import players from './players'
import categories from './categories'
import positions from './positions'
import settings from './settings'
import teams from './teams'

const rootReducer = combineReducers({
	user,
    players,
    // activePlayer,
    categories,
    positions,
    settings,
    teams,
    routing: routerReducer
})

export default rootReducer
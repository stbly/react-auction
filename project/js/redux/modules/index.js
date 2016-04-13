import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import players from './players'
import categories from './categories'
import positions from './positions'
import settings from './settings'
import teams from './teams'

const rootReducer = combineReducers({
    players,
    categories,
    positions,
    settings,
    teams,
    routing: routerReducer
})

export default rootReducer

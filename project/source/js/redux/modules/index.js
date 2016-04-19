import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import players from './players'
import activePlayer from './active-player'
import categories from './categories'
import positions from './positions'
import settings from './settings'
import teams from './teams'

const rootReducer = combineReducers({
    players,
    // activePlayer,
    categories,
    positions,
    settings,
    teams,
    routing: routerReducer
})

export default rootReducer

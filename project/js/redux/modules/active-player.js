import fetch from 'isomorphic-fetch'
import {filterBy} from '../../helpers/filterUtils';
import calculateSGPFor from '../../helpers/PlayerSgpUtils'
import * as PlayerListUtils from '../../helpers/PlayerListUtils'
import * as SettingsUtils from '../../helpers/SettingsUtils'
import assignPlayerValues from '../../helpers/PlayerValueUtils'

let initialState = {
	activePlayer: null
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'UPDATE_ACTIVE_PLAYER':
			console.log(state);
			var activePlayer = state.data.filter( player => (player.id === action.id) )

			return Object.assign({}, state, {
				activePlayer: activePlayer[0]
			});

		default:
			return state;
	}
}
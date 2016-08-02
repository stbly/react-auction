import {
	receivePlayers,
	UPDATE_PLAYER_STAT,
	RECEIVE_PLAYERS } from '../modules/players'

import computePlayerValues from '../../helpers/PlayerValueUtils'


export default function valuationMiddlware({ dispatch, getState }) {
	return next => action => {
		const state = getState()
		switch (action.type) {
			case RECEIVE_PLAYERS:
				// /users/50fZ5hfC3mWxrNcIlHhhXrR0Rxp2/players/1/stats/
				const players = action.payload || state.players.data
				if (players && state.players.didInvalidate) {
					action.payload = computePlayerValues(players, state)
				}
				break
		}

		return next(action)
	}
}
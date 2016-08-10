import {
	receivePlayers,
	UPDATE_PLAYER_STAT,
	RECEIVE_PLAYERS } from '../modules/players'

import {
	RECEIVE_SETTINGS } from '../modules/settings'

import computePlayerValues from '../../helpers/PlayerValueUtils'


export default function valuationMiddlware({ dispatch, getState }) {
	return next => action => {
		const state = getState()
		switch (action.type) {
			case RECEIVE_PLAYERS:
				const players = action.payload.players
				if (players && state.players.didInvalidate) {
					action.payload.players = computePlayerValues(players, state)
				}
				break
			case RECEIVE_SETTINGS:
				const statePlayers = state.players.data
				if (statePlayers && state.settings.didInvalidate) {
					console.log('settings changed, recomputing player values')
					dispatch( receivePlayers( computePlayerValues(statePlayers, state)) )
				}
				break
		}

		return next(action)
	}
}

import {players} from '../../data/players'

let initialState = {
	fetching: false,
	data: []
}

export function requestPlayers() {
	return { type: 'REQUEST_PLAYERS' }
}

export function receivePlayers (settings) {
   return { type: 'RECEIVE_PLAYERS', players: players }
}

export function updatePlayerFavorited (playerId) {
	return { type: 'UPDATE_PLAYER_FAVORITED', id: playerId }
}

export function updatePlayerCost (playerCost, playerId) {
	return { type: 'UPDATE_PLAYER_COST', props: {id: playerId, cost: playerCost} }
}

export function updatePlayerStat (stat, value, playerId) {
	return {type: 'UPDATE_PLAYER_STAT', props: {id: playerId, stat: stat, value:value} }
}

export function assignPlayer (playerId, cost, team) {
	return {type: 'ASSIGN_PLAYER', props: {id: playerId, cost, team} }
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_PLAYERS':
			return Object.assign({}, state, {
				fetching: true
			});

		case 'RECEIVE_PLAYERS':
			return Object.assign({}, state, {
				fetching: false,
				data: action.players
			});

		case 'UPDATE_PLAYER_FAVORITED':
			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === action.id) {
					return Object.assign({}, player, {
						isFavorited: !player.isFavorited
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers
			});

		case 'UPDATE_PLAYER_COST':
			var {id, cost} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isSelected = (cost > 0);
					return Object.assign({}, player, {
						cost: cost,
						isSelected: isSelected
					})

				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers
			});

		case 'UPDATE_PLAYER_STAT':
			var {id, stat, value} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					return Object.assign({}, player, {
						[stat]: value
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers
			});

		case 'ASSIGN_PLAYER':
			var {id, cost, team} = action.props;

			var updatedPlayers = state.data.map((player, index) => {
				if (player.id === id) {
					var isSelected = (cost > 0);
					return Object.assign({}, player, {
						team: team,
						cost: cost,
						isSelected: isSelected
					})
				}
				return player
			})

			return Object.assign({}, state, {
				data: updatedPlayers
			});

		default:
			return state;
	}
}
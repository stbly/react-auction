
const initialState = {
	fetching: false,
	players: []
}

export function playerReducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_PLAYERS':
			console.log('request players');
			return Object.assign({}, state, {
				fetching: true
			});
		case 'RECEIVE_PLAYERS':
			console.log('RECEIVE_PLAYERS');
			return Object.assign({}, state, {
				fetching: false,
				players: action.players
			});
	}

	return state;
}
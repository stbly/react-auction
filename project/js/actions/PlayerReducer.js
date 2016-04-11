
const initialState = {
	fetching: false,
	list: []
}

export function players(state = initialState, action) {
	switch (action.type) {
	case 'REQUEST_PLAYERS':
		return Object.assign({}, state, {
			fetching: true
		};
	case 'RECEIVE_PLAYERS':
		return Object.assign({}, state, {
			fetching: false,
			list: action.questions
		};
	}

	return state;
}

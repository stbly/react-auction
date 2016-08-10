
let initialState = {
	fetching: false,
	data: [
		{
			type: 'batter',
			positions: [
				{ name: '1B' },
				{
					name: '2B',
					minimum: 1
				},
				{ name: '3B' },
				{
					name: 'SS',
					minimum: 1
				},
				{ name: 'OF' },
				{
					name: 'C',
					minimum: 1
				}
			]
		},
		{
			type: 'pitcher',
			positions: [
				{ name: 'SP' },
				{
					name: 'RP',
					minimum: 2
				},
				{
					name: 'CP',
					minimum: 2
				}
			]
		}
	]
}

export function requestPositions() {
	return { type: 'REQUEST_POSITIONS' }
}

export function receivePositions (positions) {
   return { type: 'RECEIVE_POSITIONS', positions: positions }
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_POSITIONS':
			return Object.assign({}, state, {
				fetching: true
			});

		case 'RECEIVE_POSITIONS':
			return Object.assign({}, state, {
				fetching: false,
				data: action.positions
			});

		default:
			return state;
	}
}
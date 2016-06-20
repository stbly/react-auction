
let initialState = {
	fetching: false,
	data: [
		{
			type: 'batter',
			positions: [
				{ name: '1B' },
				{
					name: '2B',
					minimum: 14
				},
				{ name: '3B' },
				{
					name: 'SS',
					minimum: 14
				},
				{ name: 'OF' },
				{
					name: 'C',
					minimum: 14
				}
			]
		},
		{
			type: 'pitcher',
			positions: [
				{ name: 'SP' },
				{
					name: 'RP',
					minimum: 30
				},
				{
					name: 'CP',
					minimum: 30
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
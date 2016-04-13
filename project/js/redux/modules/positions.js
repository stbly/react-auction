
let initialState = {
	fetching: false,
	data: {
		'batter':[
			{ position: '1B' },
			{ position: '2B' },
			{ position: '3B' },
			{ position: 'SS' },
			{ position: 'OF' },
			{
				position: 'C',
				minimum: 14
			}
		],
			//'UTIL':{}
		'pitcher':[
			{ position: 'SP' },
			{
				position: 'RP',
				minimum: 30
			},
			{
				position: 'CP',
				minimum: 30
			}
		]
	}
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
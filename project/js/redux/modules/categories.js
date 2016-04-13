
let initialState = {
	fetching: false,
	data: {
		'batter': {
		    'Runs': {
				abbreviation: 'R',
				type: 'batter',
				sgpd: 20.01,
				goal: 830
		    },
		    'Home Runs': {
				abbreviation: 'HR',
				type: 'batter',
				sgpd: 9.253,
				goal: 235
		    },
		    'RBI': {
				abbreviation: 'RBI',
				type: 'batter',
				sgpd: 18.591,
				goal: 800
		    },
		    'Stolen Bases': {
				abbreviation: 'SB',
				type: 'batter',
				sgpd: 5.820,
				goal: 130
		    },
		    'Batting Average': {
				abbreviation: 'AVG',
				type: 'batter',
				sgpd: .002,
				goal: .279
		    },
		    'On Base Percentage': {
				abbreviation: 'OBP',
				type: 'batter',
				sgpd: .0028,
				goal: .350
		    },
		    'Slugging Percentage': {
				abbreviation: 'SLG',
				type: 'batter',
				sgpd: .0053,
				goal: .465
		    }
		},
		  'pitcher': {
			'Wins': {
				abbreviation: 'W',
				type: 'pitcher',
				sgpd: 3.756,
				goal: 120
			},
			'Saves': {
				abbreviation: 'SV',
				type: 'pitcher',
				sgpd: 7.868,
				goal: 100
			},
			'Holds': {
				abbreviation: 'HD',
				type: 'pitcher',
				sgpd: 20.01,
				goal: 60
			},
			'Strikeouts': {
				abbreviation: 'K',
				type: 'pitcher',
				sgpd: 50.048,
				goal: 1550
			},
			'ERA': {
				abbreviation: 'ERA',
				type: 'pitcher',
				sgpd: 0.076,
				goal: 3.25
			},
			'WHIP': {
				abbreviation: 'WHIP',
				type: 'pitcher',
				sgpd: 0.01,
				goal: 1.17
			},
			'Quality Starts': {
				abbreviation: 'QS',
				type: 'pitcher',
				sgpd: 4.796,
				goal: 130
			}
		}
	}
}

export function requestCategories() {
	return { type: 'REQUEST_CATEGORIES' }
}

export function receiveCategories (categories) {
   return { type: 'RECEIVE_CATEGORIES', categories: categories }
}

export default function reducer (state = initialState, action) {

	switch (action.type) {
		case 'REQUEST_CATEGORIES':
			return Object.assign({}, state, {
				fetching: true
			});

		case 'RECEIVE_CATEGORIES':
			return Object.assign({}, state, {
				fetching: false,
				data: action.categories
			});

		default:
			return state;
	}
}
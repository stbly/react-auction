import * as SettingsUtils from '../../helpers/SettingsUtils'

const defaultRosterSpots = 24;
const defaultBatterSpots = 13;

let initialState = {
	fetching: false,
	didInvalidate: false,
	data: {
		numTeams: 14,
		teamSalary: 270,
		totalRosterSpots: defaultRosterSpots,
		positionData: {
			batter: {
				budgetPercentage: 70,
				rosterSpots: defaultBatterSpots,
				positions: {
					'1B': {
						name: 'First Base',
					},
					'2B': {
						name: 'Second Base',
						minimum: 1
					},
					'3B': {
						name: 'Third Base'
					},
					'SS': {
						name: 'Short Stop',
						minimum: 1
					},
					'OF': {
						name: 'Outfield'
					},
					'C': {
						full_name: 'Catcher',
						minimum: 1
					}
				},
				categories: {
					'R': {
						name: 'Runs',
						type: 'batter', //TODO: get rid of this type property
						sgpd: 20.01,
						goal: 830
				    },
				    'HR': {
						name: 'Home Runs',
						type: 'batter',
						sgpd: 9.253,
						goal: 235
				    },
				    'RBI': {
						name: 'Runs Batting In',
						type: 'batter',
						sgpd: 18.591,
						goal: 800
				    },
				    'SB': {
						name: 'Stolen Bases',
						type: 'batter',
						sgpd: 5.820,
						goal: 130
				    },
				    'AVG': {
						name: 'Batting Average',
						type: 'batter',
						sgpd: .002,
						goal: .279
				    },
				    'OBP': {
						name: 'On Base Percentage',
						type: 'batter',
						sgpd: .0028,
						goal: .350
				    },
				    'SLG': {
						name: 'Slugging Percentage',
						type: 'batter',
						sgpd: .0053,
						goal: .465
				    }
				}
			},
			pitcher: {
				budgetPercentage: 30,
				rosterSpots: defaultRosterSpots - defaultBatterSpots,
				positions: {
					'SP': {
						name: 'Starting Pitcher'
					},
					'RP': {
						name: 'Relief Pitcher',
						minimum: 2
					},
					'CP': {
						name: 'Closer',
						minimum: 2
					}
				},
				categories: {
					'W': {
						full_name: 'Wins',
						type: 'pitcher',
						sgpd: 3.756,
						goal: 120
					},
					'SV': {
						full_name: 'Saves',
						type: 'pitcher',
						sgpd: 7.868,
						goal: 100
					},
					'HD': {
						full_name: 'Holds',
						type: 'pitcher',
						sgpd: 20.01,
						goal: 60
					},
					'K': {
						full_name: 'Strikeouts',
						type: 'pitcher',
						sgpd: 50.048,
						goal: 1550
					},
					'ERA': {
						full_name: 'Earned Run Average',
						type: 'pitcher',
						sgpd: 0.076,
						goal: 3.25
					},
					'WHIP': {
						full_name: 'Walks/Hits Per Inning Pitched',
						type: 'pitcher',
						sgpd: 0.01,
						goal: 1.17
					},
					'QS': {
						full_name: 'Quality Starts',
						type: 'pitcher',
						sgpd: 4.796,
						goal: 130
					}
				}
			}
		}
	}
	// data: {
		// startingSalary: 270,
		// prices: [45,33,26,22,19,17,15,13,12,11,10,8,7,6,6,5,4,3,2,2,1,1,1,1]
	// }/
}

export const INVALIDATE_SETTINGS = 'settings/INVALIDATE_SETTINGS'
export const REQUEST_SETTINGS = 'settings/REQUEST_SETTINGS'
export const RECEIVE_SETTINGS = 'settings/RECEIVE_SETTINGS'
export const UPDATE_SETTING = 'settings/UPDATE_SETTING'


export const changeSetting = (setting, value) => {
	return (dispatch, getState) => {
		dispatch( updateSetting(setting, value))
		const settings = getState().settings.data
		return dispatch( receiveSettings(settings) )
	}
}

export const invalidateSettings = () => {
	return { type: INVALIDATE_SETTINGS }
}

export const requestSettings = () => {
	return { type: REQUEST_SETTINGS }
}

export const receiveSettings  = (settings) => {
	return { type: RECEIVE_SETTINGS, payload: {settings} }
}

export const updateSetting  = (setting, value) => {
	return { type: UPDATE_SETTING, payload: {setting, value}}
}

const reducer = (state = initialState, action) => {

	switch (action.type) {
		case REQUEST_SETTINGS:
			return Object.assign({}, state, {
				fetching: true,
				didInvalidate: true
			});

		case RECEIVE_SETTINGS:
			return Object.assign({}, state, {
				fetching: false,
				didInvalidate: false,
				data: action.payload.settings
			});

		case UPDATE_SETTING:
			var {setting, value} = action.payload,
				newData = Object.assign({}, state.data, {
					[setting]: value
				})

			return Object.assign({}, state, {
				didInvalidate: true,
				data: newData
			})

		default:
			return state;
	}
}

export default reducer
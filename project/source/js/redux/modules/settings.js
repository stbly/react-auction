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
					'AB': {
						name: 'At Bats',
						average: 475
					},
					'PA': {
						name: 'Plate Appearances',
						average: 540
					},
					'R': {
						name: 'Runs',
						sgpd: 20.01,
						goal: 830
				    },
				    'HR': {
						name: 'Home Runs',
						sgpd: 9.253,
						goal: 235
				    },
				    'RBI': {
						name: 'Runs Batting In',
						sgpd: 18.591,
						goal: 800
				    },
				    'SB': {
						name: 'Stolen Bases',
						sgpd: 5.820,
						goal: 130
				    },
				    'AVG': {
						name: 'Batting Average',
						sgpd: .002,
						goal: .279,
						average: 0.268,
						isRatio: true,
						denominator: 'AB'
				    },
				    'OBP': {
						name: 'On Base Percentage',
						sgpd: .0028,
						goal: .350,
						average: 0.334,
						isRatio: true,
						denominator: 'PA'
				    },
				    'SLG': {
						name: 'Slugging Percentage',
						sgpd: .0053,
						goal: .465,
						average: 0.436,
						isRatio: true,
						denominator: 'AB'
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
					'IP': {
						name: 'Innings Pitched',
						average: 160
					},
					'W': {
						name: 'Wins',
						sgpd: 3.756,
						goal: 120
					},
					'SV': {
						name: 'Saves',
						sgpd: 7.868,
						goal: 100
					},
					'HD': {
						name: 'Holds',
						sgpd: 20.01,
						goal: 60
					},
					'K': {
						name: 'Strikeouts',
						sgpd: 50.048,
						goal: 1550
					},
					'ERA': {
						name: 'Earned Run Average',
						sgpd: 0.076,
						goal: 3.25,
						average: 3.724,
						lowIsHigh: true,
						perPeriod: 9,
						isRatio: true,
						denominator: 'IP'
					},
					'WHIP': {
						name: 'Walks/Hits Per Inning Pitched',
						sgpd: 0.01,
						goal: 1.17,
						lowIsHigh: true,
						average: 1.234,
						isRatio: true,
						denominator: 'IP'
					},
					'QS': {
						name: 'Quality Starts',
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
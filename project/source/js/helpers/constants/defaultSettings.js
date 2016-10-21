const defaultRosterSpots = 24;
const defaultBatterSpots = 13;

export const defaultSettings = {
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
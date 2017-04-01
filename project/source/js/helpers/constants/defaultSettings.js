const defaultRosterSpots = 24;
const defaultBatterSpots = 13;

export const defaultSettings = {
	numTeams: 14,
	teamSalary: 270,
	isAuctionLeague: true,
	positionData: {
		batter: {
			budgetPercentage: 70,
			rosterSpots: defaultBatterSpots,
			positions: {
				'1B': {
					name: 'First Base',
					minimum: 1
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
					name: 'Outfield',
					minimum: 3
				},
				'C': {
					name: 'Catcher',
					minimum: 1
				},
				'DH': {
					name: 'Designated Hitter',
					minimum: 0
				},
				'UTIL': {
					name: 'Utility',
					associatedPositions: ['1B', '2B', '3B', 'SS', 'OF', 'C','DH'],
					minimum: 2
				},
				'MI': {
					name: 'Middle Infielder',
					associatedPositions: ['2B', 'SS'],
					minimum: 1
				},
				'CI': {
					name: 'Corner Infielder',
					associatedPositions: ['1B', '3B'],
					minimum: 1
				}
			},
			categories: {
				'PA': {
					name: 'Plate Appearances',
					average: 540,
					order: 1
				},
				'AB': {
					name: 'At Bats',
					average: 475,
					order: 2
				},
				'R': {
					name: 'Runs',
					sgpd: 20.01,
					goal: 830,
					scoringStat: true,
					order: 3
				},
				'HR': {
					name: 'Home Runs',
					sgpd: 9.253,
					goal: 235,
					scoringStat: true,
					order: 4
				},
				'RBI': {
					name: 'Runs Batting In',
					sgpd: 18.591,
					goal: 800,
					scoringStat: true,
					order: 5
				},
				'SB': {
					name: 'Stolen Bases',
					sgpd: 5.820,
					goal: 130,
					scoringStat: true,
					order: 6
				},
				'AVG': {
					name: 'Batting Average',
					sgpd: .002,
					goal: .279,
					average: 0.268,
					isRatioStat: true,
					denominator: 'AB',
					scoringStat: true,
					order: 7
				},
				'OBP': {
					name: 'On Base Percentage',
					sgpd: .0028,
					goal: .350,
					average: 0.334,
					isRatioStat: true,
					denominator: 'PA',
					order: 8
				},
				'SLG': {
					name: 'Slugging Percentage',
					sgpd: .0053,
					goal: .465,
					average: 0.436,
					isRatioStat: true,
					denominator: 'AB',
					order: 9
				}
			}
		},
		pitcher: {
			budgetPercentage: 30,
			rosterSpots: defaultRosterSpots - defaultBatterSpots,
			positions: {
				'SP': {
					name: 'Starting Pitcher',
					minimum: 2
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
					average: 160,
					order: 1
				},
				'W': {
					name: 'Wins',
					sgpd: 3.756,
					goal: 120,
					scoringStat: true,
					order: 2
				},
				'SV': {
					name: 'Saves',
					sgpd: 7.868,
					goal: 100,
					scoringStat: true,
					order: 3
				},
				'HD': {
					name: 'Holds',
					sgpd: 20.01,
					goal: 60,
					order: 4
				},
				'K': {
					name: 'Strikeouts',
					sgpd: 50.048,
					goal: 1550,
					scoringStat: true,
					order: 5
				},
				'ERA': {
					name: 'Earned Run Average',
					sgpd: 0.076,
					goal: 3.25,
					average: 3.724,
					lowIsHigh: true,
					perPeriod: 9,
					isRatioStat: true,
					denominator: 'IP',
					scoringStat: true,
					order: 6
				},
				'WHIP': {
					name: 'Walks/Hits Per Inning Pitched',
					sgpd: 0.01,
					goal: 1.17,
					lowIsHigh: true,
					average: 1.234,
					isRatioStat: true,
					denominator: 'IP',
					scoringStat: true,
					order: 7
				},
				'QS': {
					name: 'Quality Starts',
					sgpd: 4.796,
					goal: 130,
					order: 8
				}
			}
		}
	}
}
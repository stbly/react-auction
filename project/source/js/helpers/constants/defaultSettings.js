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
					max: 1
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
					goal: 830,
					scoringStat: true,
				},
				'HR': {
					name: 'Home Runs',
					sgpd: 9.253,
					goal: 235,
					scoringStat: true
				},
				'RBI': {
					name: 'Runs Batting In',
					sgpd: 18.591,
					goal: 800,
					scoringStat: true
				},
				'SB': {
					name: 'Stolen Bases',
					sgpd: 5.820,
					goal: 130,
					scoringStat: true
				},
				'AVG': {
					name: 'Batting Average',
					sgpd: .002,
					goal: .279,
					average: 0.268,
					isRatioStat: true,
					denominator: 'AB',
					scoringStat: true
				},
				'OBP': {
					name: 'On Base Percentage',
					sgpd: .0028,
					goal: .350,
					average: 0.334,
					isRatioStat: true,
					denominator: 'PA'
				},
				'SLG': {
					name: 'Slugging Percentage',
					sgpd: .0053,
					goal: .465,
					average: 0.436,
					isRatioStat: true,
					denominator: 'AB'
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
					average: 160
				},
				'W': {
					name: 'Wins',
					sgpd: 3.756,
					goal: 120,
					scoringStat: true
				},
				'SV': {
					name: 'Saves',
					sgpd: 7.868,
					goal: 100,
					scoringStat: true
				},
				'HD': {
					name: 'Holds',
					sgpd: 20.01,
					goal: 60
				},
				'K': {
					name: 'Strikeouts',
					sgpd: 50.048,
					goal: 1550,
					scoringStat: true
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
					scoringStat: true
				},
				'WHIP': {
					name: 'Walks/Hits Per Inning Pitched',
					sgpd: 0.01,
					goal: 1.17,
					lowIsHigh: true,
					average: 1.234,
					isRatioStat: true,
					denominator: 'IP',
					scoringStat: true
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
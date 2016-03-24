const settings = {
	numTeams: 14,
	teamSalary: 270,
	startingSalary: 270,
	battingPercentage: 65,
	rosterSpots: 24,
	numBatters: 13,
	prices: [45,33,26,22,19,17,15,13,12,11,10,8,7,6,6,5,4,3,2,2,1,1,1,1],
	positions: {
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
				minimum: 20
			},
			{
				position: 'CP',
				minimum: 30
			}
		]
	},
	categories: {
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
		},
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

export { settings }

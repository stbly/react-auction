export const LEAGUE_NAME = 'leagueSettings/leagueName'

export const NUM_BATTERS = 'teamSettings/numBatters'
export const NUM_TEAMS = 'teamSettings/numTeams'
export const IS_AUCTION_LEAGUE = 'teamSettings/isAuctionLeague'
export const NUM_PITCHERS = 'teamSettings/numPitchers'

export const BUDGET_PITCHER = 'rosterSettings/pitchingBudget'
export const BUDGET_BATTER = 'rosterSettings/battingBudget'
export const POSITION_C = 'rosterSettings/positionCatcher'
export const POSITION_1B = 'rosterSettings/positionFirstBase'
export const POSITION_2B = 'rosterSettings/positionSecondBase'
export const POSITION_3B = 'rosterSettings/positionThirdBase'
export const POSITION_SS = 'rosterSettings/positionShortStop'
export const POSITION_OF = 'rosterSettings/positionOutfield'
export const POSITION_DH = 'rosterSettings/positionDesignatedHitter'
export const POSITION_MI = 'rosterSettings/positionMiddleInfielder'
export const POSITION_CI = 'rosterSettings/positionCornerInfielder'
export const POSITION_UTIL = 'rosterSettings/positionUtility'
export const POSITION_SP = 'rosterSettings/positionStartingPitcher'
export const POSITION_RP = 'rosterSettings/positionReliefPitcher'
export const POSITION_CP = 'rosterSettings/positionClosingPitcher'

const POSITION_SETTINGS_DICTIONARY = {
	'BUDGET_PITCHER': BUDGET_PITCHER,
	'BUDGET_BATTER': BUDGET_BATTER,
	'POSITION_C': POSITION_C,
	'POSITION_1B': POSITION_1B,
	'POSITION_2B': POSITION_2B,
	'POSITION_3B': POSITION_3B,
	'POSITION_SS': POSITION_SS,
	'POSITION_OF': POSITION_OF,
	'POSITION_DH': POSITION_DH,
	'POSITION_MI': POSITION_MI,
	'POSITION_CI': POSITION_CI,
	'POSITION_UTIL': POSITION_UTIL,
	'POSITION_SP': POSITION_SP,
	'POSITION_RP': POSITION_RP,
	'POSITION_CP': POSITION_CP,
}

export const settingsEndpoints = {
    [NUM_BATTERS]: 'positionData/batter/rosterSpots',
    [NUM_PITCHERS]: 'positionData/pitcher/rosterSpots',
    [NUM_TEAMS]: 'numTeams',
    [IS_AUCTION_LEAGUE]: 'isAuctionLeague',
	[BUDGET_PITCHER]: 'positionData/pitcher/budgetPercentage',
	[BUDGET_BATTER]: 'positionData/batter/budgetPercentage',
	[POSITION_C]: 'positionData/batter/positions/C/minimum',
	[POSITION_1B]: 'positionData/batter/positions/1B/minimum',
	[POSITION_2B]: 'positionData/batter/positions/2B/minimum',
	[POSITION_3B]: 'positionData/batter/positions/3B/minimum',
	[POSITION_SS]: 'positionData/batter/positions/SS/minimum',
	[POSITION_OF]: 'positionData/batter/positions/OF/minimum',
	[POSITION_DH]: 'positionData/batter/positions/DH/minimum',
	[POSITION_MI]: 'positionData/batter/positions/MI/minimum',
	[POSITION_CI]: 'positionData/batter/positions/CI/minimum',
	[POSITION_UTIL]: 'positionData/batter/positions/UTIL/minimum',
	[POSITION_SP]: 'positionData/pitcher/positions/SP/minimum',
	[POSITION_RP]: 'positionData/pitcher/positions/RP/minimum',
	[POSITION_CP]: 'positionData/pitcher/positions/CP/minimum',
}

export const createLeagueSettings = (settings) => {
	const { isAuctionLeague } = settings
	return {
		[IS_AUCTION_LEAGUE]: {
			label: 'Is Auction League',
			value: isAuctionLeague,
			isBoolean: true
		}
	}
}

export const createTeamSettings = (settings) => {
	const { numTeams, positionData } = settings
	return {
		[NUM_TEAMS]: {
			label: 'Number of Teams',
			value: numTeams
		},
		[NUM_BATTERS]: {
			label: 'Number of Batters p/ Team',
			value: positionData.batter.rosterSpots
		},
		[NUM_PITCHERS]: {
			label: 'Number of Pitchers p/ Team',
			value: positionData.pitcher.rosterSpots
		}
	}
}

export const createPositionSettings = (type, positionSettings, isAuctionLeague) => {
	const { positions, budgetPercentage } = positionSettings
	const budgetKey = POSITION_SETTINGS_DICTIONARY['BUDGET_' + type.toUpperCase()]

	const settings = {}

	if (isAuctionLeague) {
		settings[budgetKey] = {
			label: 'Percent of Budget',
			value: budgetPercentage
		}
	}

	const positionKeys = Object.keys(positions)

	positionKeys.forEach( key => {
		const positionKey = POSITION_SETTINGS_DICTIONARY['POSITION_' + key.toUpperCase()]
		const {minimum, min, max} = positions[key]
		settings[positionKey] = {
			label: key,
			value: minimum,
			min,
			max
		} 
	})

	return settings
}

export const createCategorySettings = (categories) => {
	
	const categoryKeys = Object.keys(categories).filter( key => {
		return !categories[key].isCountingStatRatioModifier
	})

	return categoryKeys.map( key => {
		const {name, scoringStat, sgpd} = categories[key]
		return {
			label: key,
			checked: scoringStat,
			sgpd
		} 
	})

}

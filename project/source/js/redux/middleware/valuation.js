import {
	receivePlayers,
	RECEIVE_PLAYERS,
	fetchPlayers } from '../modules/players'

import {
	RECEIVE_SETTINGS } from '../modules/settings'

import {
	RECEIVE_TEAMS,
	RECEIVE_TEAM_PLAYERS } from '../modules/teams'

import { filterBy } from '../../helpers/filterUtils';
import { assignPlayerValues } from '../../helpers/PlayerValueUtils'
import { calculateSGPFor} from '../../helpers/PlayerSgpUtils'
import { rankPlayers } from '../../helpers/PlayerListUtils';

const computeAllPlayerValues = (players, settings) => {
	const {
		numTeams,
		teamSalary,
		positionData,
		isAuctionLeague } = settings

	const playersArray = Object.toArray(players)
	const positionDataTypes = Object.toArray(positionData, 'type')
	const totalMoneyInPool = teamSalary * numTeams;

	const valuedPlayers = positionDataTypes.map( playerType => {
		const { categories, budgetPercentage, rosterSpots, positions, type } = playerType
		const playersOfType = filterBy(playersArray, 'type', type)
		const categoriesArray = Object.toArray(categories)
		const positionsArray = Object.toArray(positions)
		const playersToDraft = rosterSpots * numTeams
		const dollarsToSpend = totalMoneyInPool * (budgetPercentage / 100)
		const playersWithSGPCalculated = calculateSGPFor(playersOfType, categoriesArray, rosterSpots)
		const normalizedPositions = normalizePositions(positionsArray, numTeams)
		return assignPlayerValues(playersWithSGPCalculated, playersToDraft, dollarsToSpend, normalizedPositions)
	})

	const combinedPlayers = Array.concat.apply([],valuedPlayers)
	const rankedPlayers = rankPlayers(combinedPlayers, 'adjustedValue', true )

	/*if (!isAuctionLeague) {
		rankedPlayers.forEach( player => {
			const round = player.rank % numTeams
			player.rank = 
		})
	}*/

	return Array.toObject(combinedPlayers)
}

const normalizePositions = (positionsArray, numTeams) => {
	return positionsArray.map(
		position => {
			const minimumPerTeam = position.minimum
			const minimum = (minimumPerTeam || 0) * numTeams
			return Object.assign({}, position, { minimum })
		}
	)
}

const teamsWidthBudgetData = (teams, players, settings) => {

	const { teamSalary, positionData } = settings
	const teamsCopy = Object.assign({}, teams)

	const rosterSpots = Object.keys(positionData)
		.map( type => positionData[type].rosterSpots )
		.reduce( (a,b) => a + b)

	Object.keys(teams).forEach( teamId => {

		const budgetData = {}
		const playerIds = teams[teamId].players || []
		let spent = 0;

		Object.keys(positionData).forEach( type => {

			const playerIdsOfType = playerIds.filter( id => players[id].type === type)
			const playersOfType = playerIdsOfType.map( id => players[id] )
			const positionTypeSalary = (positionData[type].budgetPercentage / 100) * teamSalary
			const rosterSpotsOfType = positionData[type].rosterSpots

			let spentOnType = 0;
			

			const spentOnPlayers = playersOfType.forEach( player => {
				spent += player.cost
				spentOnType += player.cost
			})

			const remainingBudgetOfType = positionTypeSalary - spentOnType
			const spotsOfTypeLeft = rosterSpotsOfType - (playersOfType ? playersOfType.length : 0)
			const maxBidOfType = remainingBudgetOfType - spotsOfTypeLeft + 1
			const averageBidOfType = remainingBudgetOfType / (spotsOfTypeLeft);

			Object.assign( budgetData, {
				[type]: {
					maxBid: maxBidOfType,
					remainingBudget: remainingBudgetOfType,
					averageBid: averageBidOfType
				}
			})
		})

		const spotsLeft = rosterSpots - (playerIds ? playerIds.length : 0)
		const remainingBudget = teamSalary - spent
		const maxBid = remainingBudget - spotsLeft + 1
		const averageBid = remainingBudget / spotsLeft;

		teamsCopy[teamId].budgetData = Object.assign( budgetData, { 
			remainingBudget, 
			averageBid,
			maxBid
		});
	})

	return teamsCopy;
}

const valuationMiddlware = ({ dispatch, getState }) => {
	return next => action => {
		const state = getState()
		const { teams, settings, players } = state
		const playerData = players.data
		const settingsData = settings.data

		switch (action.type) {
			case RECEIVE_PLAYERS:
				const actionPlayerData = action.payload.players
				if (actionPlayerData && players.didInvalidate) {
					action.payload.players = computeAllPlayerValues(actionPlayerData, settingsData)
				}
				break

			case RECEIVE_SETTINGS:
				const actionSettingsData = action.payload.settings

				if (playerData && !players.didInvalidate && settings.didInvalidate) {
					console.log('settings changed, recomputing player values')
					dispatch( receivePlayers( computeAllPlayerValues(playerData, actionSettingsData) ))
				}
				break

			case RECEIVE_TEAMS: 
				let { teams } = action.payload;
				action.payload.teams = teamsWidthBudgetData(teams, playerData, settingsData)	
				break

			// case RECEIVE_TEAM_PLAYERS:
				// const {teamId, newPlayers} = action.payload
		}

		return next(action)
	}
}

export default valuationMiddlware
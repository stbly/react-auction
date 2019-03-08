import firebase from 'firebase'
import { firebaseData } from './api'

import { settingsEndpoints } from '../../helpers/constants/settings'
import { cleanObject } from '../../helpers/dataUtils'

import {
	UPDATE_PLAYER_STATS,
	UPDATE_PLAYER_COST,
	UPDATE_PLAYER_FAVORITED,
	UPDATE_PLAYER_NOTES,
	UPDATE_PLAYER_OWNER,
	UPDATE_PLAYER_DRAFTED,
	UPDATE_PLAYER_SLEEPER_STATUS,
	UPDATE_PLAYER_TIER,
	UPDATE_PLAYER_TEMP } from '../modules/players'

import {
	UPDATE_SETTING } from '../modules/settings'

import {
	UPDATE_ACTIVE_LEAGUE_NAME,
	CREATE_LEAGUE } from '../modules/leagues'

import {
	CHANGE_TEAM_NAME,
	RECEIVE_TEAM_PLAYERS,
	REMOVE_ALL_PLAYERS } from '../modules/teams'

// TODO: Refactor this so that it takes advantage of the api middleware; not sure if firebase middleware is needed
// TODO update: yes, we should handle all this stuff in a POST handler in API Middleware

const getUserRef = () => {
	return firebaseData.ref().child("users")
}

const updateFirebaseUserPlayerStats = (state, action) => {
	const {id, stats} = action.payload
	const usersRef = getUserRef()
	const updateObject = {}

	stats.forEach(entry => {
		const {stat, value} = entry
		const path = state.user.uid + '/players/' + id + '/stats/' + stat + '/'
		updateObject[path] = Number(value)
	})

	usersRef.update(updateObject)
}

const updateFirebaseUserPlayerDraftPrice = (state, action) => {
	const {id, cost} = action.payload
	const { activeLeague } = state.leagues
	const usersRef = getUserRef()
	const leagueId = activeLeague.id

	const path = state.user.uid + '/leagues/' + leagueId + '/players/' + id + '/cost/'

	let costToSend = (cost || cost === 0) ? Number(cost) : null
	console.log('sending draft price to firebase', costToSend)
	usersRef.update({
		[path]: costToSend
	})
}

const updateFirebaseUserPlayerFavorited = (state, action) => {
	const {id} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/isFavorited/'

	const isFavorited = state.players.data[id].isFavorited ? null : true

	usersRef.update({
		[path]: isFavorited
	})
}


const updateFirebaseUserPlayerSleeperStatus = (state, action) => {
	const {id} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/isSleeper/'

	const isSleeper = state.players.data[id].isSleeper ? null : true
	console.log(path, isSleeper)
	usersRef.update({
		[path]: isSleeper
	})
}

const updateFirebaseUserPlayerNotes = (state, action) => {
	const {id, notes} = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/players/' + id + '/notes/'

	const notesToServer = notes.length > 0 ? notes : null

	usersRef.update({
		[path]: notesToServer
	})
}

const updateFirebaseUserSetting = (state, action) => {
	const { activeLeague } = state.leagues
	const { id } = activeLeague
	if (!id) return

	const {setting, value, endpoint} = action.payload
	const usersRef = getUserRef()
	const settingEndpoint = endpoint || settingsEndpoints[setting]
	const path = state.user.uid + '/leagues/' + id + '/settings/' + settingEndpoint

	// console.log(path, value)

	usersRef.update({
		[path]: value
	})
}

const updateFirebaseLeagueName = (state, action) => {
	const { activeLeague } = state.leagues
	const { id } = activeLeague
	if (!id) return

	const { name } = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/leagues/' + id + '/name/'

	usersRef.update({
		[path]: name
	})
}

const addLeagueToFirebase = (state, action) => {
	const { id, leagueObject } = action.payload
	const usersRef = getUserRef()
	const path = state.user.uid + '/leagues/' + id + '/'

	const { defaults } = state.settings
	const { settings } = leagueObject

	const cleanedLeagueObject = Object.assign({}, leagueObject, {
		settings: cleanObject(settings, defaults)
	})

	const { numTeams } = settings
	cleanedLeagueObject.teams = createDefaultTeams(numTeams)

	usersRef.update({
		[path]: cleanedLeagueObject
	})
}

const createDefaultTeams = (numTeams) => {
	let teams = {}
	for (let i=0; i < numTeams; i++) {
		const name = i === 0 ? 'My Team' : 'Team ' + (i + 1)
		Object.assign(teams, { ['team' + i]: { name } })
	}
	return teams
}

const updatePlayerOwner = (state, action) => {
	const { payload } = action
	const { id, team } = payload
	const { activeLeague } = state.leagues
	const usersRef = getUserRef()

	const playerPath = state.user.uid + '/leagues/' + activeLeague.id + '/players/' + id + '/owner/'
	usersRef.update({
		[playerPath]: team
	})
}

const updatePlayerTemp = (state, action) => {
	const { payload } = action
	const { id, temp } = payload
	const usersRef = getUserRef()
	console.log('updatePlayerTemp on firebase')
	const playerPath = state.user.uid + '/players/' + id + '/temp/'
	usersRef.update({
		[playerPath]: temp
	})
}

const updateTeamPlayers = (state, action) => {
	const { payload } = action
	const { teamId, players } = payload
	const { activeLeague } = state.leagues

	const usersRef = getUserRef()
	const teamPath = state.user.uid + '/leagues/' + activeLeague.id + '/teams/' + teamId + '/players/'
	usersRef.update({
		[teamPath]: players
	})
}

const updateTeamName = (state, action) => {
	const { payload } = action
	const { teamId, name } = payload
	const { activeLeague } = state.leagues

	const usersRef = getUserRef()
	const teamPath = state.user.uid + '/leagues/' + activeLeague.id + '/teams/' + teamId + '/name/'

	usersRef.update({
		[teamPath]: name
	})
}

const updatePlayerDrafted = (state, action) => {
	const { payload } = action
	const { id, isDrafted } = payload
	const { activeLeague } = state.leagues

	const usersRef = getUserRef()
	const isDraftedPath = state.user.uid + '/leagues/' + activeLeague.id + '/players/' + id + '/isDrafted'
	console.log('updatePlayerDrafted', id, isDrafted)
	usersRef.update({
		[isDraftedPath]: isDrafted
	})
}

const updatePlayerTier = (state, action) => {
	const { payload } = action
	const { id, position, value } = payload
	const { activeLeague } = state.leagues

	const usersRef = getUserRef()
	const tierPath = state.user.uid + '/leagues/' + activeLeague.id + '/players/' + id + '/tiers/' + position

	usersRef.update({
		[tierPath]: value
	})
}

const actionHandlers = {
	[UPDATE_PLAYER_STATS]: updateFirebaseUserPlayerStats,
	[UPDATE_PLAYER_COST]: updateFirebaseUserPlayerDraftPrice,
	[UPDATE_PLAYER_FAVORITED]: updateFirebaseUserPlayerFavorited,
	[UPDATE_PLAYER_SLEEPER_STATUS]: updateFirebaseUserPlayerSleeperStatus,
	[UPDATE_PLAYER_NOTES]: updateFirebaseUserPlayerNotes,
	[UPDATE_PLAYER_OWNER]: updatePlayerOwner,
	[UPDATE_SETTING]: updateFirebaseUserSetting,
	[UPDATE_ACTIVE_LEAGUE_NAME]: updateFirebaseLeagueName,
	[CREATE_LEAGUE]: addLeagueToFirebase,
	[CHANGE_TEAM_NAME]: updateTeamName,
	[RECEIVE_TEAM_PLAYERS]: updateTeamPlayers,
	[UPDATE_PLAYER_DRAFTED]: updatePlayerDrafted,
	[UPDATE_PLAYER_TIER]: updatePlayerTier,
	[UPDATE_PLAYER_TEMP]: updatePlayerTemp
}

export default function firebaseMiddleware({ dispatch, getState }) {
	return next => action => {
		const state = getState()
		const handler = actionHandlers[action.type]
		if (handler && state.user.uid) {
			handler(state, action)
		}

		return next(action)
	}
}

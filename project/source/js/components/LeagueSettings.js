import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import { 
	NUM_BATTERS, 
	NUM_PITCHERS,
	NUM_TEAMS,
	createTeamSettings,
	createPositionSettings } from '../helpers/constants/settings'

import InputToggle from './InputToggle'
import Settings from './Settings'

import '../../stylesheets/components/league-settings.scss'

class LeagueSettings extends Component {
	constructor(props) {
		super(props);
	}

	getMinimumDraftedPlayersOfType (type) {
		const { settings } = this.props
		const { positionData, numTeams } = settings
		const { positions } = positionData[type]

		return Object.keys(positions).map( position => {
			const positionData = positions[position]
			const { minimum } = positionData
			return minimum ? minimum * numTeams : numTeams
		}).reduce( (prev, curr) =>  prev + curr )
	}

	/*
	getRosterMinimum () {
		const {numTeams, numBatters} = this.props.settings
		const minBatters = numBatters * numTeams
		const minPitchers = this.getMinimumDraftedPlayersOfType('pitcher')

		return Math.ceil((minPitchers + minBatters) / numTeams)
	}*/

	getMinimumPlayersPerTeamOfType (type) {
		const { numTeams } = this.props.settings
		const minPlayers = this.getMinimumDraftedPlayersOfType(type)

		return Math.ceil(minPlayers / numTeams)
	}

	getTotalRosterSpots () {
		const { positionData, numTeams } = this.props.settings

		return Object.keys(positionData).map( type => {
			return positionData[type].rosterSpots * numTeams
		}).reduce( (prev, curr) => prev + curr )
	}

	getMaximumPlayersPerTeamOfType (type) {
		const { numTeams, positionData } = this.props.settings
		const minPlayers = this.getMinimumDraftedPlayersOfType(type)
		const totalPlayers = this.getTotalRosterSpots()

		return Math.ceil((totalPlayers - minPlayers) / numTeams)
	}

	getSettingMin(setting) {
		const settingMins = {
			// rosterSpots: this.getRosterMinimum(),
			[NUM_BATTERS]: 1,//this.getMinimumPlayersPerTeamOfType('batter'),
			[NUM_PITCHERS]: 1//this.getMinimumPlayersPerTeamOfType('pitcher')
		}

		return settingMins[setting] || 0
	}

	getSettingsMax(setting) {
		const settingMaxs = {
			[NUM_BATTERS]: 50,//this.getMaximumPlayersPerTeamOfType('batter'),
			[NUM_PITCHERS]: 50,//this.getMaximumPlayersPerTeamOfType('pitcher')
		}

		return settingMaxs[setting] || 999
	}


	render() {
		const { name, settings, changeLeagueName } = this.props
		const { numTeams, teamSalary } = settings

		return (
			<div className='league-settings'>

				<h1 className='league-name'>
					<InputToggle value={name} type='text' valueDidChange={changeLeagueName} />
				</h1>
				{ this.renderTeamSettingsSection() }
				{ this.renderPositionSettingsSection() }

			</div>
		)
	}

	renderTeamSettingsSection () {
		const { settings, changeSetting } = this.props
		if (!settings) return

		const teamSettings = createTeamSettings(settings)

		return (
			<section className='team-settings'>
				<h2>Team Settings</h2>	
				<Settings settings={teamSettings} onChange={changeSetting} />
			</section>
		)
	}

	renderPositionSettingsSection () {
		const { settings } = this.props
		if (!settings) return

		const { positionData } = settings
		if (!positionData) return

		const allPositionSettings = Object.keys(positionData).map( (type, index) => {
			return this.renderPositionSettings( type, positionData[type] )
		})

		return (
			<section className='team-settings'>
				{allPositionSettings}
			</section>
		)
	}

	renderPositionSettings (type, positionSettingsObject) {
		const { changeSetting } = this.props
		const positionSettings = createPositionSettings(type, positionSettingsObject)

		return (
			<div key={type} className='position-settings'>
				<h2>{type} Settings</h2>	
				<Settings settings={positionSettings} onChange={changeSetting} />
			</div>
		)
	}



}

LeagueSettings.propTypes = {
    settings: PropTypes.object.isRequired,
    name: PropTypes.string,
    changeSetting: PropTypes.func,
    changeLeagueName: PropTypes.func,
    teams: PropTypes.object,
}

export default LeagueSettings
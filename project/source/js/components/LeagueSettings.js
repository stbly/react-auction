import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import { 
	NUM_BATTERS, 
	NUM_PITCHERS,
	NUM_TEAMS,
	createTeamSettings,
	createPositionSettings } from '../helpers/constants/settings'

import InputToggle from './InputToggle'
import SettingsInputs from './SettingsInputs'

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
	}
	*/

	settingWasChanged (setting, value) {
		const { changeSetting } = this.props

		if ( changeSetting ) {
			changeSetting(setting, value)
		}
	}

	leagueNameWasChanged (name) {
		const { changeLeagueName } = this.props
		if ( changeLeagueName ) {
			changeLeagueName(name)
		}
	}

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
		const { name, settings } = this.props
		const { numTeams, teamSalary } = settings

		return (
			<div className='league-settings'>

				<h1 className='league-name'>
					<InputToggle 
						value={name} 
						type='text' 
						placeholder='League Name' 
						valueDidChange={this.leagueNameWasChanged.bind(this)} />
				</h1>
				{ this.renderTeamSettingsSection() }
				{ this.renderPositionSettingsSection() }
			</div>
		)
	}

	renderTeamSettingsSection () {
		const { settings } = this.props
		if (!settings) return

		const teamSettings = createTeamSettings(settings)

		return (
			<section className='team-settings'>
				<h2>Team Settings</h2>	
				<SettingsInputs settings={teamSettings} onChange={this.settingWasChanged.bind(this)} />
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
		const positionSettings = createPositionSettings(type, positionSettingsObject)

		return (
			<div key={type} className='position-settings'>
				<h2>{type} Settings</h2>	
				<SettingsInputs settings={positionSettings} onChange={this.settingWasChanged.bind(this)} />
			</div>
		)
	}

}

LeagueSettings.propTypes = {
    settings: PropTypes.object.isRequired,
    name: PropTypes.string,
    changeSetting: PropTypes.func,
    changeLeagueName: PropTypes.func
}

export default LeagueSettings
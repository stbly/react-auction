import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import { 
	NUM_BATTERS, 
	NUM_PITCHERS,
	NUM_TEAMS,
	createTeamSettings,
	createLeagueSettings,
	createBudgetSettings,
	createPositionSettings,
	createOneDollarPlayerSettings,
	createCategorySettings } from '../helpers/constants/settings'

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

	settingWasChanged (setting, value, endpoint) {
		const { changeSetting } = this.props


		if ( changeSetting ) {
			changeSetting(setting, value, endpoint)
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

				{ settings && this.renderLeagueSettingsSection( settings ) }
				{ settings && this.renderTeamSettingsSection( settings ) }
				{ settings && this.renderPositionSettingsSection( settings ) }

			</div>
		)
	}

	renderLeagueSettingsSection (settings) {
		const leagueSettings = createLeagueSettings(settings)

		return (
			<section className='league-specific-settings'>
				<h2>League Settings</h2>	
				<SettingsInputs settings={leagueSettings} onChange={this.settingWasChanged.bind(this)} />
			</section>
		)
	}

	renderTeamSettingsSection (settings) {
		const teamSettings = createTeamSettings(settings)

		return (
			<section className='team-settings'>
				<h2>Team Settings</h2>	
				<SettingsInputs settings={teamSettings} onChange={this.settingWasChanged.bind(this)} />
			</section>
		)
	}

	renderPositionSettingsSection (settings) {
		const { positionData, isAuctionLeague } = settings
		if (!positionData) return

		const allPositionSettings = Object.keys(positionData).map( (type, index) => {
			return this.renderPositionSettings( type, positionData[type], isAuctionLeague )
		})

		return (
			<section className='team-settings'>
				{allPositionSettings}
			</section>
		)
	}

	renderPositionSettings (type, positionSettingsObject, isAuctionLeague) {
		const categoryNames = {
			batter: 'Batting',
			pitcher: 'Pitching'
		}
		const categoryName = categoryNames[type]
		const positionSettings = createPositionSettings(type, positionSettingsObject, isAuctionLeague)
		const categorySettings = createCategorySettings(positionSettingsObject.categories)
		const budgetSettings = createBudgetSettings(type, positionSettingsObject)

		return (
			<div key={type} className='position-settings'>
				
				{isAuctionLeague && 
					<div>
						<h2>{categoryName.toNormalCase()} Budget Settings</h2>	
						<SettingsInputs settings={budgetSettings} onChange={this.settingWasChanged.bind(this)}/>
					</div>
				}
				
				<h2>{categoryName.toNormalCase()} Position Settings</h2>	
				{isAuctionLeague && 
					<SettingsInputs settings={createOneDollarPlayerSettings(type, positionSettingsObject)} onChange={this.settingWasChanged.bind(this)}/>
				}
				<SettingsInputs settings={positionSettings} onChange={this.settingWasChanged.bind(this)} />

				<h2>{categoryName.toNormalCase()} Categories</h2>
				<div className='position-settings-container'>
					{categorySettings.map( (category, index) => {
						return (
							<div key={index} className='position-setting'>
								<input className='position-toggle'
									type="checkbox" 
									checked={category.checked}
									onChange={ (e) => {
										const { checked } = e.target
										const endpoint = 'positionData/' + type + '/categories/' + category.label + '/scoringStat'
										this.settingWasChanged('scoringStat', checked, endpoint)
									}} />

								<span>{category.label}</span>

								{category.sgpd && category.checked &&
									<span className='sgpd-container'>
										<span>SGPD</span>
										<InputToggle 
											type='number' 
											step={0.001} 
											value={category.sgpd}
											valueDidChange={(value) => {
												const endpoint = 'positionData/' +  type + '/categories/' + category.label + '/sgpd'
												this.settingWasChanged('sgpd', value, endpoint)
											}}
											allowZero={true}
											min={ 0 } />
									</span>
								}
							</div>
						)
					})}
				</div>
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
import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import { 
	NUM_BATTERS, 
	NUM_PITCHERS,
	NUM_TEAMS } from '../helpers/constants/settings'

import InputToggle from './InputToggle'

class RosterSettings extends Component {

	render() {
		
		return (
			<div className='settings roster-settings'>

			</div>
		)
	}

	renderInputs () {
		const settingInputs = this.getSettingInputs()

		return Object.keys(settingInputs).map( (setting, index) => {
			const updateSetting = this.updateSettingFactory(setting)
			const { label, value } = settingInputs[setting]

			return <span className='setting-property' key={index}>
				{label}: <InputToggle
					id={index}
					value={value}
					valueDidChange={updateSetting.bind(this)}
					max={ this.getSettingsMax(setting) }
					min={ this.getSettingMin(setting) } />
			</span>
		})
	}
}

RosterSettings.propTypes = {
    positionType: PropTypes.string.isRequired,
    categories: PropTypes.object.isRequired,
    positions: PropTypes.object,
    budgetPercentage: PropTypes.number,
    changeSetting: PropTypes.func
}

export default RosterSettings
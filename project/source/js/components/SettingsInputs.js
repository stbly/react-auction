import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import InputToggle from './InputToggle'

class SettingsInputs extends Component {

	onChangeFactory (id, isBoolean) {
		const { onChange } = this.props
		return (value) => {
			onChange(id, isBoolean ? value : Number(value))
		}
	}

	render() {
		
		return (
			<div className='settings'>
				{this.renderInputs()}
			</div>
		)
	}

	renderInputs () {
		const { settings } = this.props
		
		return Object.keys(settings).map( (setting, index) => {
			const { isBoolean } = settings[setting]

			if (isBoolean) {
				return this.renderCheckBox(setting, settings[setting], index)
			} else {
				return this.renderInputToggle(setting, settings[setting], index)
			}
		})
	}

	renderInputToggle (settingName, setting, index) {
		const onChangeSetting = this.onChangeFactory(settingName)
		const { label, value, min, max, isBoolean } = setting

		return <span className='settings-property' key={index}>
			{label}: <InputToggle
				value={value}
				valueDidChange={onChangeSetting}
				allowZero={true}
				max={ max }
				min={ min } />
		</span>
	}

	renderCheckBox (settingName, setting, index) {
		const onChangeSetting = this.props.onChange
		const { label, value, min, max, isBoolean } = setting

		return <div key={index} className='settings-property'>
			<input className='setting-toggle'
				type="checkbox" 
				checked={value}
				onChange={ (e) => {
					const { checked } = e.target
					onChangeSetting(settingName, checked)
				}} />
			<span>{label}</span>
		</div>
	}
}

SettingsInputs.propTypes = {
    settings: PropTypes.object.isRequired,
    onChange: PropTypes.func
}

export default SettingsInputs
import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import InputToggle from './InputToggle'

class Settings extends Component {

	onChangeFactory (id) {
		const { onChange } = this.props
		return (value) => {
			onChange(id, Number(value))
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
			const onChangeSetting = this.onChangeFactory(setting)
			const { label, value, min, max } = settings[setting]

			return <span className='settings-property' key={index}>
				{label}: <InputToggle
					id={index}
					value={value}
					valueDidChange={onChangeSetting}
					max={ min }
					min={ max } />
			</span>
		})
	}
}

Settings.propTypes = {
    settings: PropTypes.object.isRequired,
    onChange: PropTypes.func
}

export default Settings
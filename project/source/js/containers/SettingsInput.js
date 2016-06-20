import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import * as playerActions from '../redux/modules/players'
import * as settingsActions from '../redux/modules/settings'
import ValueInput from '../components/ValueInput'

import '../../stylesheets/components/settings-input.scss'

class SettingsInput extends Component {
	constructor(props) {
		super(props)
	}

	updateSetting (value, e) {
		this.props.settingsActions.updateSetting(e.props.id, value)
		this.props.playerActions.invalidatePlayers()
	}

	render () {
		var loading = classNames({'is-loading': this.props.isLoading});

		return (
			<div className='settings-input'>
				{this.renderInputs()}
			</div>
		)
	}

	renderInputs () {
		return Object.keys(this.props.settings).map( (setting, index) => {
			return <span className='setting-property' key={index}>
				{setting}: <ValueInput
					id={setting}
					value={this.props.settings[setting]}
					valueDidChange={this.updateSetting.bind(this)}
					max={999}
					min={0} />
			</span>
		})
	}
}



function mapDispatchToProps(dispatch) {
    return {
        settingsActions: bindActionCreators(settingsActions, dispatch),
        playerActions: bindActionCreators(playerActions, dispatch)
    }
}

function mapStateToProps (state,ownProps) {

	if (!state.settings.data) {
		return {}
	}

	return {
		settings: state.settings.data
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsInput)

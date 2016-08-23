import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import * as playerActions from '../redux/modules/players'
import * as settingsActions from '../redux/modules/settings'
import InputToggle from '../components/InputToggle'

import '../../stylesheets/components/settings-input.scss'

class SettingsInput extends Component {
	constructor(props) {
		super(props)
	}

	updateSetting (value, e) {
		this.props.settingsActions.changeSetting(e.props.id, Number(value))
	}

	getMinimumTotalPitchers () {
		const {settings, positions} = this.props
		return positions[1].positions.map( position => {
			return position.minimum ? position.minimum * settings.numTeams : settings.numTeams
		}).reduce( (prev, curr) =>  prev + curr )
	}

	getMinimumTotalBatters () {
		const {settings, positions} = this.props
		return positions[0].positions.map( position => {
			return position.minimum ? position.minimum * settings.numTeams : settings.numTeams
		}).reduce( (prev, curr) =>  prev + curr )
	}

	getRosterMinimum () {
		const {numTeams, numBatters} = this.props.settings
		const minBatters = numBatters * numTeams
		const minPitchers = this.getMinimumTotalPitchers()

		return Math.ceil((minPitchers + minBatters) / numTeams)
	}

	getBatterMinimum () {
		const {numTeams} = this.props.settings
		const minBatters = this.getMinimumTotalBatters()

		return Math.ceil(minBatters / numTeams)
	}

	getBatterMaximum () {
		const {numTeams, numBatters, rosterSpots} = this.props.settings
		const minPitchers = this.getMinimumTotalPitchers()
		const totalPlayers = rosterSpots * numTeams

		return Math.ceil((totalPlayers - minPitchers) / numTeams)
	}

	getSettingMin(setting) {
		switch (setting) {
			case 'rosterSpots':
				return this.getRosterMinimum()
			case 'numBatters':
				return this.getBatterMinimum()
			default:
				return 0
		}
	}

	getSettingMax(setting) {
		switch (setting) {
			case 'numBatters':
				return this.getBatterMaximum()
			default:
				return 999
		}
	}

	render () {
		const loading = classNames({'is-loading': this.props.isLoading});

		return (
			<div className='settings-input'>
				{this.renderInputs()}
			</div>
		)
	}

	renderInputs () {
		return Object.keys(this.props.settings).map( (setting, index) => {
			return <span className='setting-property' key={index}>
				{setting}: <InputToggle
					id={setting}
					value={this.props.settings[setting]}
					valueDidChange={this.updateSetting.bind(this)}
					max={ this.getSettingMax(setting) }
					min={ this.getSettingMin(setting) } />
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
		settings: state.settings.data,
		positions: state.positions.data
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsInput)

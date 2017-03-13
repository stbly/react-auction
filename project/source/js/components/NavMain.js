import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import '../../stylesheets/components/nav-main.scss'

import Login from './Login';
import Input from './Input'

import * as leagueActions from '../redux/modules/leagues'

class NavMain extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		const {loggedIn} = this.props
		return (
			<div className='nav-main'>
				<span>FBB Auction Draft Tool</span>
				{loggedIn && this.renderLeagueDropdown()}
				<Link to="/players" activeClassName='active'>Players</Link>
				<Link to="/settings" activeClassName='active'>Settings</Link>
				<Link to="/teams" activeClassName='active'>Teams</Link>
				<Login />
			</div>
		)
	}

	renderLeagueDropdown () {
		const { leagues, leagueActions } = this.props 
		const { changeActiveLeague } = leagueActions
		const { data, activeLeague } = leagues
		const leagueKeys = Object.keys(data)
		const leagueNames = leagueKeys.map( key => data[key] )
		const leagueData = leagueKeys.map( key => {
			return {
				'id': key,
				'label': data[key]
			}
		})
		return <Input type='select' value={activeLeague.name} options={leagueData} valueDidUpdate={(leagueName) => {
			const selectedLeagueId = leagueKeys[ leagueNames.indexOf(leagueName) ]
			changeActiveLeague(selectedLeagueId)
		}} />
	}
}

function mapDispatchToProps(dispatch) {
	return {
		leagueActions: bindActionCreators(leagueActions, dispatch)
	}
}

function mapStateToProps (state,ownProps) {
	var leagues = state.leagues

	return {
		leagues,
		loggedIn: state.user.uid && leagues.activeLeague
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(NavMain)
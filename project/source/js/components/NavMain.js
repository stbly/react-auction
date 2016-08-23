import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classNames from 'classnames';

import '../../stylesheets/components/nav-main.scss'

import Login from './Login';

class NavMain extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		return (
			<div className='nav-main'>
				<span>FBB Auction Draft Tool</span>
				<Link to="/players" activeClassName='active'>Players</Link>
				<Link to="/leagues" activeClassName='active'>Leagues</Link>

				<Login />
			</div>
		)
	}
}

export default NavMain;

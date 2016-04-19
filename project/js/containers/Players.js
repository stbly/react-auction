import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import ValueList from '../components/ValueList'
import ActivePlayer from './ActivePlayer'
import PlayerListsContainer from './PlayerListsContainer'
import FavoritePlayerListsContainer from './FavoritePlayerListsContainer'

import classNames from 'classnames';

import '../../stylesheets/components/app.scss'
import '../../stylesheets/components/players.scss'

class Players extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		console.log( 'rendering' )
		return (

			<div className='players-route page'>

				<FavoritePlayerListsContainer />

				<div className='combined-rankings'>

					<PlayerListsContainer />

					<div className='clear-both'></div>
				</div>

				<div className='clear-both'></div>
			</div>
		)
	}
}

export default Players;

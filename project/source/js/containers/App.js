import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

import SettingsInput from './SettingsInput'
import NavMain from '../components/NavMain'

import '../../stylesheets/components/app.scss'

class App extends Component {
	constructor(props) {
		super(props)
	}

				// <SettingsInput />

	render() {
		return (
			<div className='app'>

				<NavMain />

				{this.props.children || "No Child Route yet"}
			</div>
		)
	}
}

export default App;

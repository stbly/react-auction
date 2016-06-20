import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

import SettingsInput from './SettingsInput'

import '../../stylesheets/components/app.scss'

class App extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className='app'>

				<SettingsInput />

				{this.props.children || "No Child Route yet"}
			</div>
		)
	}
}

export default App;

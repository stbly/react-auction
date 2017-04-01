import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

import NavMain from '../components/NavMain'

import '../../stylesheets/components/app.scss'

String.prototype.toNormalCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

class App extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className='app draft-planner'>

				<NavMain />

				{this.props.children || "No Child Route yet"}
			</div>
		)
	}
}

export default App;

import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import '../../stylesheets/components/app.scss'

class App extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className='app'>
				{this.props.children || "No Child Route yet"}
                <Link to='/players'>Go to players</Link>

			</div>
		)
	}
}

export default App;

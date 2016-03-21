import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import Players from './containers/Players'
//import { Provider } from 'react-redux'
import { Router, Route, Link, browserHistory, IndexRoute } from 'react-router'
//import configureStore from './store/configureStore'
//import * as actions from './actions/index'

render((
	<Router history={browserHistory}>
		<Route name='app' path="/" component={App}>
			<Route path='players' component={Players} />
		</Route>
	</Router>
), document.getElementById('root'))

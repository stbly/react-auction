import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import Players from './containers/Players'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, Link, browserHistory, IndexRoute } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import configureStore from './redux/store'

//import configureStore from './store/configureStore'
//import * as actions from './actions/index'

const store = configureStore();

const history = syncHistoryWithStore(browserHistory, store)

render((
	<Provider store={store}>
		<Router history={history}>
			<Route name='app' path="/" component={App}>
				<Route path='players' component={Players} />
			</Route>
		</Router>
	</Provider>
), document.getElementById('root'))

import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import ValueList from '../components/ValueList'
import {players} from '../data/players'
import {settings} from '../data/settings'

import '../../stylesheets/components/app.scss'

class App extends Component {
	constructor(props) {
		super(props)
	}

	getCategories (type) {
		var categoryList = [];

		for (var key in settings.categories) {
			var category = settings.categories[key];
			if (category.type === type) {
				categoryList.push(category)
			}
		}

		return categoryList;
	}

	getPlayers (type) {
		var playerList = [];

		for(var key in players) {
			var player = players[key];
			if (player.type === type) {
				playerList.push(player);
			}
		}

		return playerList;
	}

	getTotalSalary () {
		return settings.teamSalary * settings.numTeams;
	}

	getDollars (type) {
		if (type === 'batter') {
			return this.getTotalSalary() * (settings.battingPercentage / 100);
		} else {
			return this.getTotalSalary() * ((100 -settings.battingPercentage) / 100);
		}
	}

	getPlayersToDraft (type) {
		if (type === 'batter') {
			return settings.numBatters * settings.numTeams;
		} else {
			return (settings.rosterSpots - settings.numBatters) * settings.numTeams;
		}
	}

	getScarcePositions (type) {

		var positionList = settings.positions[type];
		var scarcePositions = [];

		positionList.forEach(function (position) {
			if (position.minimum) {
				scarcePositions.push(position);
			}
		});

		return scarcePositions;
	}

	render() {
		return (
			<div className='players-route combined-rankings'>
				<ValueList type='batter' players={this.getPlayers('batter')} dollars={this.getDollars('batter')} spots={settings.numBatters} playersToDraft={this.getPlayersToDraft('batter')} scarcePositions={this.getScarcePositions('batter')} categories={this.getCategories('batter')}/>
				<ValueList type='pitcher' players={this.getPlayers('pitcher')} dollars={this.getDollars('pitcher')} spots={settings.rosterSpots - settings.numBatters} playersToDraft={this.getPlayersToDraft('pitcher')} scarcePositions={this.getScarcePositions('pitcher')} categories={this.getCategories('pitcher')}/>
			</div>
		)
	}
}

export default App;

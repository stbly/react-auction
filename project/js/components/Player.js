import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/player.scss'
import ValueInput from './ValueInput'

class Player extends Component {
	constructor (props) {
			super(props)
			this.state = {
				hovered: false,
				isEditing: false
			}
	}

	componentWillReceiveProps (nextProps) {
	}

	componentDidMount() {
	}

	componentDidUpdate() {
		//console.log(this.props.player.name,this.props.player.cost);
		// this.setState({showCost:this.props.player.cost > 0});
	}

	getStats () {
		var stats = [];

		var _this = this;
		for(var key in this.props.categories) {
			if (this.props.categories.hasOwnProperty(key)) {
				var category = this.props.categories[key].abbreviation;
				var stat = this.props.player[category];
				var ratioStat = (category === 'AVG' || category === 'OBP' || category === 'SLG' || category === 'OPS' || category === 'ERA' || category === 'WHIP');
				var decimalPlaces = ratioStat ? 3 : 0;

				var statEl = <ValueInput
					key={key}
					value={stat}
					stat={category}
					currentEditElement={this.state.currentEditElement}
					didStartEditing={this.setEditState.bind(this)}
					valueDidChange={this.updatePlayerStat.bind(this)} />

				stats.push(statEl)
			}
		}
		return stats;
	}

	getPosition () {
		var pos = this.props.player.pos;
		var posName = '';

		switch (true) {
			case pos === '1B':
				posName = 'first-base';
				break;
			case pos === '2B':
				posName = 'second-base';
				break;
			case pos === '3B':
				posName = 'third-base';
				break;
			case pos === 'SS':
				posName = 'short-stop';
				break;
			case pos === 'C':
				posName = 'catcher';
				break;
			case pos === 'OF':
				posName = 'outfield';
				break;
			case pos === 'SP':
				posName = 'starting-pitcher';
				break;
			case pos ==='CP':
				posName = 'closer';
				break;
			case pos === 'RP':
				posName = 'relief-pitcher';
				break;
			default:
				posName = 'default';
				break;
		}
		return posName.toLowerCase();
	}

	editStats (e) {
		console.log('editStats');
		this.setState({isEditing:true})
	}

	stopEditing (e) {
		console.log('stop editing');
		if (this.state.isEditing) {
			this.setState({isEditing:false})
		}
	}

	handleMouseOver (e) {
		if (!this.state.isEditing) {
			this.setState({hover: true});
		}
	}

	handleMouseOut (e) {
		if (!this.state.isEditing) {
			this.setState({hover: false});
		}

	}

	getRankView () {
		var el;

		if (this.state.hover) {
			// onClick={this.editStats.bind(this)}
			el = <td className='edit-player'>Edit</td>
		} else {
			el = <td>{this.props.player.rank}</td>
		}
		return el;
	}

	setEditState (dispatcher) {
		this.setState({isEditing: true});
		this.setState({currentEditElement: dispatcher})
	}

	updatePlayerStat (value, e) {
		// var stat = e.target.getAttribute('data-name');

		this.setState({isEditing: false});
		this.setState({hover: false});
		this.setState({currentEditElement: null})

		if (this.props.updateStat) {
			this.props.updateStat(e.props.stat, value, this.props.player.id);
		}
	}

	updatePlayerCost (cost) {
		// this.setState({cost: this.state.costInputValue});
		// this.setState({showCost: this.state.costInputValue > 0});
		// e.target.blur();
		this.setState({isEditing: false});
		this.setState({hover: false});
		this.setState({currentEditElement: null})

		if (this.props.updateCost) {
			console.log(cost, this.props.player.id);
			this.props.updateCost(cost, this.props.player.id);
		}
	}

	render () {
		var playerClasses = classNames('player', {'selected':this.props.player.selected}, {'is-editing':this.state.isEditing});
		var positionClasses = classNames('position', this.getPosition())

		return (
			<tr onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)} className={playerClasses}>
				{this.getRankView()}
				<td className='favorite-toggle'></td>
				<td>{this.props.player.name}</td>
				<td className={positionClasses}>{this.props.player.pos}</td>
				<td><span className='dollar-amount'>{this.props.player.bidPrice}</span></td>
				<ValueInput
					classNames={['dollar-amount']}
					value={this.props.player.cost}
					currentEditElement={this.state.currentEditElement}
					didStartEditing={this.setEditState.bind(this)}
					valueDidChange={this.updatePlayerCost.bind(this)}
				/>
				<td className='dark'><span className='dollar-amount'>{this.props.player.displayValue}</span></td>
				<td className='dark'><span className='dollar-amount'>{this.props.player.displayInflatedValue}</span></td>
				{this.getStats()}
			</tr>
		)
	}
}

Player.propTypes = {

}

export default Player;

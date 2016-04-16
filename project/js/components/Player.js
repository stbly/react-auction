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
				isEditing: false,
				isFavorited: false,
			}
	}

	componentWillReceiveProps (nextProps) {
		this.setState({isFavorited:nextProps.player.isFavorited})
	}

	componentDidMount() {
		this.setState({isFavorited:this.props.player.isFavorited})
	}

	componentDidUpdate() {
		//console.log(this.props.player.name,this.props.player.cost);
		// this.setState({showCost:this.props.player.cost > 0});
	}

	getCheckbox () {
		var el;
		if (!this.props.player.isSelected) {
			el = <input
				ref={(ref) => this.isFavorited = ref}
				type="checkbox"
				checked={this.state.isFavorited}
				onChange={this.togglePlayerFavorited.bind(this)} />
		}
		return el;
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
		// console.log('editStats');
		this.setState({isEditing:true})
	}

	stopEditing (e) {
		// console.log('stop editing');
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

	setEditState (dispatcher) {
		this.setState({isEditing: true});
		this.setState({currentEditElement: dispatcher})
	}

	updatePlayerStat (value, e) {
		// console.log('updatedPlayerStat()')
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
			// console.log(cost, this.props.player.id);
			this.props.updateCost(cost, this.props.player.id);
		}
	}

	togglePlayerFavorited (e) {
		// console.log('update');
		var newSetting = !this.state.isFavorited;
		this.setState({isFavorited: newSetting})
		if (this.props.updateFavorited) {
			this.props.updateFavorited(this.props.player.id);
		}
	}

	getMetaInfo () {
		var els = [];
		if (!this.props.hideMetaInfo) {
			els.push(<td key={this.props.player.rank}>{this.props.player.rank}</td>);
			els.push(
				<td key={this.props.player.rank + 'favorite-toggle'} className='favorite-toggle'>
					{this.getCheckbox()}
				</td>
			);
		}
		return els;
	}

	selectPlayer () {
		if (this.props.playerSelected) {
			this.props.playerSelected(this.props.player.id)
		}
	}

	getValueInfo () {
		var els = [];

		if (this.props.player.cost) {
			return <td key={'display-value-td'} colSpan='3'><span className='player-cost'>Drafted: <span className='dollar-amount'>{this.props.player.cost}</span></span></td>
		}

		var costInputClasses = classNames('can-edit','position',this.getPosition());
		if (!this.props.hideCostInput) {
			els.push(
				<td key={'cost-input-td'} className={costInputClasses}>
					<ValueInput
						classNames={['dollar-amount']}
						value={this.props.player.cost}
						currentEditElement={this.state.currentEditElement}
						didStartEditing={this.setEditState.bind(this)}
						valueDidChange={this.updatePlayerCost.bind(this)} />
				</td>
			);
		}

		if (!this.props.hideValueInfo) {
			els.push(<td key={'inflated-display-value-td'} ><span className='dollar-amount'>{this.props.player.displayInflatedValue}</span></td>);
			els.push(<td key={'display-value-td'} ><span className='dollar-amount'>{this.props.player.displayValue}</span></td>);
		}

		return els;
	}

	getStats () {
		var stats = [];

		var _this = this;

		if (!this.props.hideStats) {
			for(var key in this.props.categories) {
				if (this.props.categories.hasOwnProperty(key)) {
					var category = this.props.categories[key].abbreviation;
					var stat = this.props.player[category];
					var ratioStat = (category === 'AVG' || category === 'OBP' || category === 'SLG' || category === 'OPS' || category === 'ERA' || category === 'WHIP');
					var decimalPlaces = ratioStat ? 3 : 0;

					stat = Number(stat).toFixed(decimalPlaces);

					var statEl = <td key={key} className='can-edit'>
						<ValueInput
							value={stat}
							stat={category}
							currentEditElement={this.state.currentEditElement}
							didStartEditing={this.setEditState.bind(this)}
							valueDidChange={this.updatePlayerStat.bind(this)} />
						</td>

					stats.push(statEl)
				}
			}
		}
		return stats;
	}

	render () {
		var playerClasses = classNames('player', {'selected':this.props.player.isSelected}, {'is-editing':this.state.isEditing});
		var positionClasses = classNames('position', this.getPosition());

		return (
			<tr onMouseOver={this.handleMouseOver.bind(this)} onMouseOut={this.handleMouseOut.bind(this)} className={playerClasses}>
				{this.getMetaInfo()}
				<td className={positionClasses}>{this.props.player.pos}</td>
				<td onClick={this.selectPlayer.bind(this)} className={positionClasses}>{this.props.player.name}</td>
				{this.getValueInfo()}
				{this.getStats()}
			</tr>
		)
	}
}

Player.propTypes = {

}

export default Player;

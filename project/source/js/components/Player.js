import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
import {primaryPositionFor, playerIsDrafted, playerIsUndrafted} from '../helpers/PlayerListUtils';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/player.scss'
import ValueInput from './ValueInput'
import IconButton from './IconButton'

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
		if (playerIsUndrafted(this.props.player)) {
			el= <IconButton
					toggleButton={this.togglePlayerFavorited.bind(this)}
					active={this.props.player.isFavorited}
					type={'watch'} />
		}
		return el;
	}

	getPosition () {
		var pos = primaryPositionFor(this.props.player);
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

	startEditing (e) {
		if (e) {
			var editTarget = e.target.getAttribute('data-edittarget');
			if (editTarget) {
				this.valueToStartEditing = editTarget;
			}
		}
		this.setState({ isEditing: true })
	}

	stopEditing (e) {
		// console.log('stop editing');
		if (this.state.isEditing) {
			this.setState({hovered:false})
			this.setState({isEditing:false})
		}
	}

	handleMouseOver (e) {
		if (!this.state.isEditing) {
			this.setState({hovered: true});
		}
	}

	handleMouseOut (e) {
		if (!this.state.isEditing) {
			this.setState({hovered: false});
		}

	}

	setEditState (dispatcher) {
		this.setState({currentEditElement: dispatcher});
		this.startEditing();
	}

	updatePlayerStat (value, e) {
		// console.log('updatedPlayerStat()')
		// var stat = e.target.getAttribute('data-name');
		this.setState({isEditing: false});
		this.setState({hover: false});
		this.setState({currentEditElement: null})

		if (this.props.updateStat) {
			this.props.updateStat(this.props.player.id, e.props.stat, value);
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
			this.props.updateCost(this.props.player.id, cost);
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

	startEditingValue (input) {
		var editTarget = this[input];
		editTarget.startEditing();
	}

	getMetaInfo () {
		var els = [];
		if (!this.props.hideMetaInfo) {
			els.push(<td key={this.props.player.rank}>{this.props.rank}</td>);
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

	getPlayerInfo () {
		if (this.props.hidePlayerInfo) {
			return;
		}

		var positionClasses = classNames('position', this.getPosition());

		return ([
			<td key={'player-pos'} className={positionClasses}>{primaryPositionFor(this.props.player)}</td>,
			<td key={'player-name'} onClick={this.selectPlayer.bind(this)} className={positionClasses}>{this.props.player.name}</td>
		])
	}

	getValueInfo () {
		var els = [];

		if (this.props.player.cost && (!this.state.isEditing && !this.props.hideCostInput && !this.props.hideValueInfo)) {
			var cellWidth = 3;
			if (this.props.hideCostInput) {
				cellWidth = 2;
			} else if (this.props.hideValueInfo) {
				cellWidth = 1;
			}

			var text = this.state.hovered ? 'Value' : 'Drafted'
			var value = this.state.hovered ? this.props.player.adjustedValue.toFixed(0) : this.props.player.cost
			return <td key={'display-value-td'}
						className='display-value-td'
						onMouseOver={this.handleMouseOver.bind(this)}
						onMouseOut={this.handleMouseOut.bind(this)}
						onClick={this.startEditing.bind(this)}
						data-edittarget={'playerCostInput'}
						colSpan={cellWidth}>
							<span className='player-cost'>{text}:
								<span className='dollar-amount'> {value}</span>
							</span>
						</td>
		}

		// var costInputClasses = classNames('can-edit','position',this.getPosition());
		if (!this.props.hideCostInput) {
			els.push(
				<td key={'cost-input-td'} className='can-edit'>
					<ValueInput
						ref={(ref) => this.playerCostInput = ref}
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
			els.push(<td key={'display-value-td'}><span className='dollar-amount'>{this.props.player.displayValue}</span></td>);
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
					var stat = this.props.player.stats[category];
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

	componentDidUpdate (prevProps, prevState) {
		if (this.valueToStartEditing) {
			this.startEditingValue(this.valueToStartEditing);
			this.valueToStartEditing = null;
		}

	}

	render () {
		var playerClasses = classNames('player', this.props.player.type, {'selected':playerIsDrafted(this.props.player)}, {'is-editing':this.state.isEditing});

		return (
			<tr className={playerClasses} onBlur={this.stopEditing.bind(this)}>
				{this.getMetaInfo()}
				{this.getPlayerInfo()}
				{this.getValueInfo()}
				{this.getStats()}
			</tr>
		)
	}
}

Player.propTypes = {

}

export default Player;

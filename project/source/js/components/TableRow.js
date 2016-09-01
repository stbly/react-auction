import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
import {primaryPositionFor, playerIsDrafted, playerIsUndrafted} from '../helpers/PlayerListUtils';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/player.scss'
import InputToggle from './InputToggle'
import IconButton from './IconButton'

import TableCell from './TableCell.js'
import InputPlayerStat from './InputPlayerStat.js'

class TableRow extends Component {
	constructor (props) {
		super(props)
		/*this.state = {
			hovered: false,
			isEditing: false,
			isFavorited: false,
		}*/
	}
/*
	componentWillReceiveProps (nextProps) {
		this.setState({isFavorited:nextProps.player.isFavorited})
	}

	componentDidMount() {
		this.setState({isFavorited:this.props.player.isFavorited})
	}

	componentDidUpdate() {
		//console.log(this.props.player.name,this.props.player.cost);
		// this.setState({showCost:this.props.player.cost > 0});
	}*/
/*
	getCheckbox () {
		let el;
		if (playerIsUndrafted(this.props.player)) {
			el= <IconButton
					toggleButton={this.togglePlayerFavorited.bind(this)}
					active={this.props.player.isFavorited}
					type={'watch'} />
		}
		return el;
	}

	getPosition () {
		const pos = primaryPositionFor(this.props.player);
		let posName = '';

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
	}*/
/*
	startEditing (e) {
		if (e) {
			const editTarget = e.target.getAttribute('data-edittarget');
			if (editTarget) {
				this.valueToStartEditing = editTarget;
			}
		}
		this.setState({ isEditing: true })
	}

	stopEditing (e) {
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
		this.startEditing();
	}

	updatePlayerStat (stat, value) {
		// console.log('updatedPlayerStat()')
		// var stat = e.target.getAttribute('data-name');
		this.setState({isEditing: false});
		this.setState({hover: false});
		if (this.props.updateStat) {
			this.props.updateStat(this.props.data.id, stat, value);
		}
	}

	updatePlayerCost (cost) {
		// this.setState({cost: this.state.costInputValue});
		// this.setState({showCost: this.state.costInputValue > 0});
		// e.target.blur();
		this.setState({isEditing: false});
		this.setState({hover: false});
		if (this.props.updateCost) {
			// console.log(cost, this.props.data.id);
			this.props.updateCost(this.props.data.id, cost);
		}
	}

	togglePlayerFavorited (e) {
		// console.log('update');
		const newSetting = !this.state.isFavorited;
		this.setState({isFavorited: newSetting})
		if (this.props.updateFavorited) {
			this.props.updateFavorited(this.props.data.id);
		}
	}

	startEditingValue (input) {
		const editTarget = this[input];
		editTarget.startEditing();
	}

	getMetaInfo () {
		let els = [];
		if (!this.props.hideMetaInfo) {
			els.push(<td key={this.props.data.rank}>{this.props.data.rank}</td>);
			els.push(
				<td key={this.props.data.rank + 'favorite-toggle'} className='favorite-toggle'>
					{this.getCheckbox()}
				</td>
			);
		}
		return els;
	}

	selectPlayer () {
		if (this.props.dataSelected) {
			this.props.dataSelected(this.props.data.id)
		}
	}

	getPlayerInfo () {
		if (this.props.hidePlayerInfo) {
			return;
		}

		const positionClasses = classNames('position', this.getPosition());

		return ([
			<td key={'data-pos'} className={positionClasses}>{primaryPositionFor(this.props.player)}</td>,
			<td key={'player-name'} onClick={this.selectPlayer.bind(this)} className={positionClasses}>{this.props.player.name}</td>
		])
	}

	getValueInfo () {
		let els = [];

		if (this.props.player.cost && (!this.state.isEditing && !this.props.hideCostInput && !this.props.hideValueInfo)) {
			let cellWidth = 3;
			if (this.props.hideCostInput) {
				cellWidth = 2;
			} else if (this.props.hideValueInfo) {
				cellWidth = 1;
			}

			const text = this.state.hovered ? 'Value' : 'Drafted'
			const value = this.state.hovered ? this.props.player.adjustedValue.toFixed(0) : this.props.player.cost

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
					<InputToggle
						ref={(ref) => this.playerCostInput = ref}
						classNames={'dollar-amount'}
						value={this.props.player.cost}
						didStartEditing={this.setEditState.bind(this)}
						valueDidChange={this.updatePlayerCost.bind(this)} />
				</td>
			);
		}

		if (!this.props.hideValueInfo) {
			els.push(<td key={'inflated-display-value-td'} ><span className='dollar-amount'>{this.props.player.adjustedValue.toFixed(1)}</span></td>);
			els.push(<td key={'display-value-td'}><span className='dollar-amount'>{this.props.player.value.toFixed(1)}</span></td>);
		}

		return els;
	}

	componentDidUpdate (prevProps, prevState) {
		if (this.valueToStartEditing) {
			this.startEditingValue(this.valueToStartEditing);
			this.valueToStartEditing = null;
		}

	}*/

	render () {
		const rowClasses = classNames('table-row');

		return (
			<tr className={rowClasses}>
				{this.renderCells()}
			</tr>
		)
}
/*const playerClasses = classNames('player', this.props.player.type, {'selected':playerIsDrafted(this.props.player)}, {'is-editing':this.state.isEditing});

		return (
			<tr className={playerClasses} onBlur={this.stopEditing.bind(this)}>

				{this.renderCells()}

			</tr>
		)*/

	renderCells () {
		const { data, columns } = this.props

		return columns.map( (column, index) => {
			const { category, cellContent, cellContentParams } = column
			return (
				<TableCell
					key={data.id + index}
					data={data}
					category={category}
					cellContent={cellContent}
					cellContentParams={cellContentParams} />
			)
		})
	}
}

TableRow.propTypes = {
	data: PropTypes.object.isRequired,
	columns: PropTypes.array.isRequired
}

export default TableRow;

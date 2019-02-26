import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputPlayerCost from './InputPlayerCost'

import '../../stylesheets/components/cell-player-cost.scss'

class CellPlayerCost extends Component {

	startEditing () {
		this.input.startEditing()
	}

	componentDidMount () {
		// console.log('mounted')
	}

	shouldComponentUpdate (nextProps, nextState) {
		// console.log(nextProps.cost !== this.props.cost)
		return (
			nextProps.id !== this.props.id ||
			nextProps.cost !== this.props.cost
		)
	}

	render () {
		// console.log('updating')
		const { cost, onCostChange, disabled } = this.props
		const prefix = cost && !disabled ? 'Drafted:' : null
		const classes = classNames('cell-player-cost', {'is-drafted': cost, 'is-disabled': disabled},)
		
		return (
			<div className={classes}
				onClick={this.startEditing.bind(this)}>
					{prefix}
					<InputPlayerCost
						ref={(ref) => this.input=ref }
						cost = {cost}
						disabled = {disabled}
						onCostChange = {onCostChange} />
			</div>
		)
	}
}

CellPlayerCost.propTypes = {
	cost: PropTypes.number,
	onCostChange: PropTypes.func,
	disabled: PropTypes.bool
}

export default CellPlayerCost;
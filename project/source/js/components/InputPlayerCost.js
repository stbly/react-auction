import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputToggle from './InputToggle'

class InputPlayerCost extends Component {

	onCostChange (newCost) {
		const { onCostChange } = this.props
		if (onCostChange) {
			const costToSend = newCost === '' ? null : newCost
			return onCostChange(costToSend)
		}
	}
	
	startEditing () {
		this.input.startEditing()
	}

	render () {
		const { cost, disabled } = this.props
		const classes = classNames({'dollar-amount': cost > 0})

		return (
			<InputToggle
				ref={(ref) => this.input = ref}
				value={cost}
				max={100}
				min={0}
				disabled={disabled}
				className={classes}
				valueDidChange={this.onCostChange.bind(this)} />
		)
	}
}

InputPlayerCost.propTypes = {
	cost: PropTypes.number,
	onCostChange: PropTypes.func,
}

export default InputPlayerCost;
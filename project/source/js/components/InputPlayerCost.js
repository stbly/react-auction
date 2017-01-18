import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputToggle from './InputToggle'

class InputPlayerCost extends Component {

	onCostChange (newCost) {
		const { onCostChange } = this.props
		if (onCostChange) {
			return onCostChange(newCost)
		}
	}

	startEditing () {
		this.ref.startEditing()
	}

	render () {
		const { cost, disabled } = this.props
		const costToShow = (cost === 0) ? '' : cost
		const classes = classNames({'dollar-amount': cost > 0})

		return (
			<InputToggle
				ref={(ref) => this.ref = ref}
				value={costToShow}
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
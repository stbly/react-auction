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

	render () {
		const { cost } = this.props
		return (
			<InputToggle
				value={cost}
				max={100}
				min={0}
				valueDidChange={this.onCostChange.bind(this)} />
		)
	}
}

InputPlayerCost.propTypes = {
	cost: PropTypes.number,
	onCostChange: PropTypes.func,
}

export default InputPlayerCost;
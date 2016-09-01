import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputToggle from './InputToggle'

class InputPlayerStat extends Component {

	onStatChange (value) {
		const { category, onStatChange } = this.props
		if (onStatChange) {
			return onStatChange(category, value)
		}
	}

	render () {
		const { category, value, isRatio } = this.props
		const decimalPlaces = isRatio ? 3 : 0;
		const increment = isRatio ? 0.001 : 1;
		const max = isRatio ? 1 : 999;
		const inputValue = Number(value || 0).toFixed(decimalPlaces);

		return (
			<InputToggle
				value={inputValue}
				step={increment}
				max={max || 1000}
				min={0}
				valueDidChange={this.onStatChange.bind(this)} />
		)
	}
}

InputPlayerStat.propTypes = {
	category: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	onStatChange: PropTypes.func,
	isRatio: PropTypes.bool,
}

export default InputPlayerStat;
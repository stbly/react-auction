import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputToggle from './InputToggle'

class InputPlayerStat extends Component {

	constructor (props) {
		super(props)
		this.state = {
			searchValue: null
		}
	}

	shouldComponentUpdate (nextProps) {
		// console.log('should component update?', nextProps.value !== this.props.value)
		return nextProps.value !== this.props.value
	}

	onStatChange (value) {
		const { category, onStatChange } = this.props
		if (onStatChange) {
			return onStatChange(value)
		}
	}

	render () {
		// console.log('component does update')
		const { category, value, isRatioStat, disabled, max, min } = this.props
		const decimalPlaces = isRatioStat ? 3 : 0;
		const increment = isRatioStat ? 0.001 : 1;
		const maxVal = max ? max : (isRatioStat ? 1 : 999);
		const minVal = min ? min : 0;
		const inputValue = Number(value || 0).toFixed(decimalPlaces);
		
		return (
			<InputToggle
				value={inputValue}
				step={increment}
				max={maxVal}
				min={minVal}
				disabled={disabled}
				valueDidChange={this.onStatChange.bind(this)} />
		)
	}
}

InputPlayerStat.propTypes = {
	category: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	onStatChange: PropTypes.func,
	isRatioStat: PropTypes.bool,
	disabled: PropTypes.bool
}

export default InputPlayerStat;
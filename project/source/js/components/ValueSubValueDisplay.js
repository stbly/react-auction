import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import '../../stylesheets/components/value-sub-value-display.scss'

class ValueSubValueDisplay extends Component {
	constructor (props) {
		super(props)
		this.state = {
		}
	}

	render () {

		const { value, subValue, heading, valueIsDollarAmount, className } = this.props

		const valueClasses = classNames('value-amount', {'dollar-amount': valueIsDollarAmount})
		return (
			<div className={classNames('value-sub-value-display', className)}>

				<div className='value'>
					<div className='heading'>{heading}</div>
					<div className='value-amount-container'>
						<div className={valueClasses}>{value}</div>
					</div>
				</div>

				{ subValue && this.renderSubValue() }
				
			</div>
		)
	}

	renderSubValue () {
		const { subValue, subValueHeading, subValueIsDollarAmount } = this.props
		const subValueClasses = classNames('value-amount', {'dollar-amount': subValueIsDollarAmount})

		return <div className='sub-value'>
			<div className='heading'>{subValueHeading}</div>
			<div className='value-amount-container'>
				<div className={subValueClasses}> {subValue}</div>
			</div>
		</div>
	}
}

ValueSubValueDisplay.propTypes = {
	value: PropTypes.number,
	valueIsDollarAmount: PropTypes.bool,
	subValue: PropTypes.number,
	subValueIsDollarAmount: PropTypes.bool,
	heading: PropTypes.string,
	subValueHeading: PropTypes.string
}

export default ValueSubValueDisplay

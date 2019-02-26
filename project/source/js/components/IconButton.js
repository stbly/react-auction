import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import Icon from './Icon'

import '../../stylesheets/components/icon_button.scss'

class IconButton extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		const { isActive, isDisabled, children } = this.props
		const iconClasses = classNames('icon-button', {active: isActive, disabled: isDisabled})

		return (
			<button className={iconClasses} onClick={(e) => isDisabled ? null : this.props.toggleButton(e)}>
				{children}
				<span className='icon-container'>
					<Icon type={this.props.type} />
				</span>
			</button>
        )
	}
}

IconButton.propTypes = {
	type: PropTypes.string.isRequired,
	toggleButton: PropTypes.func,
	isActive: PropTypes.bool
}

export default IconButton
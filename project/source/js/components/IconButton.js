import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import Icon from './Icon'

class IconButton extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		const { isActive, children } = this.props
		const iconClasses = classNames('icon-button', {active: isActive})

		return (
			<button className={iconClasses} onClick={this.props.toggleButton}>
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
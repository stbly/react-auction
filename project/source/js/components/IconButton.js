import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import Icon from './Icon'

class IconButton extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		var iconClasses = classNames('icon-button', {active: this.props.isActive})

		return (
			<button className={iconClasses} onClick={this.props.toggleButton}>
				<Icon type={this.props.type} />
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
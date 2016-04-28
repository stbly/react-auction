import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import Icon from './Icon'

class IconButton extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		var iconClasses = classNames('icon-button', {active: this.props.active})

		return (
			<button className={iconClasses} onClick={this.props.toggleButton}>
				<Icon type={this.props.type} />
			</button>
        )
	}
}

export default IconButton
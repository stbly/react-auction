import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import '../../stylesheets/helpers/icons.scss'

const ICONS = {
    'watch': require('../../icons/watch.svg'),
    'avoid': require('../../icons/avoid.svg'),
    'preloader': require('../../icons/preloader.svg')
}

class Icon extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		var iconClasses = classNames('icon',this.props.type)
		var width = this.props.width || '100%'
		var height = this.props.height || '100%'

		return (
			<svg className={iconClasses} width={ width } height={ height }>
	            <use xlinkHref={ ICONS[this.props.type] } />
	        </svg>
        )
	}
}

export default Icon
import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import '../../stylesheets/helpers/_icons.scss'

const ICONS = {
    'watch': require('../../icons/watch.svg'),
    'avoid': require('../../icons/avoid.svg'),
    'preloader': require('../../icons/preloader.svg'),
    'add': require('../../icons/plus.svg')
}

class Icon extends Component {
	constructor(props) {
		super(props)
	}

	render () {
		var iconClasses = classNames('icon',this.props.type)
		var width = this.props.width || '100%'
		var height = this.props.height || '100%'
		var style = {width, height}

		return (
			<svg className={iconClasses} style={style}>
	            <use xlinkHref={ ICONS[this.props.type] } />
	        </svg>
        )
	}
}

export default Icon
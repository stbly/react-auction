import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

class TableCell extends Component {

	shouldComponentUpdate(nextProps, nextState) {
		const {data, category} = this.props

		return (nextProps.data[nextProps.category] !== data[category])
	}

	render () {
		const { category, classes } = this.props

		return (
			<td className={classNames(category, classes)} >
				{ this.renderContent() }
			</td>
		)
	}

	renderContent () {
		const { data, category, cellContent, cellContentParams } = this.props
		const params = cellContentParams ? cellContentParams.map( param => data[param] ) : [data]

		return cellContent ? cellContent(...params) : data[category]
	}
}

TableCell.propTypes = {
	data: PropTypes.object.isRequired,
	category: PropTypes.string.isRequired,
	cellContent: PropTypes.func,
	cellContentParams: PropTypes.array
}

export default TableCell
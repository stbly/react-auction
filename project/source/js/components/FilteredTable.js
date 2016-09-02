import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import { primaryPositionFor } from '../helpers/PlayerListUtils'
import { valueMatch } from '../helpers/arrayUtils'
import { stringMatch } from '../helpers/stringUtils'

import Table from './Table.js'
import ListFilters from './ListFilters'

//MAJOR TODO: allow filters to be cumulative, not just one at a time

class FilteredTable extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filter: {
				property: 'type',
				value: 'batter'
			},
			searchQuery: null
		}
	}

	setFilter (property, value) {
		const { onDataFiltered } = this.props

		this.setState({
			filter: {
				property,
				value
			}
		})

		if (onDataFiltered) {
			onDataFiltered(property, value)
		}
	}

	getFilteredData () {
		const { searchQuery } = this.state
		const { data, searchParameter } = this.props

		let filteredData = this.filterData(data);

		if (searchQuery && searchQuery.length > 2) {
			filteredData = filteredData.filter( item => {
				const searchProperty = item[searchParameter]
				return stringMatch(searchProperty, searchQuery)
			})
		}

		return filteredData
	}

	filterData (data) {
		const { property, value } = this.state.filter

		return data.filter( item => {
			const propertyToCompare = (property === 'pos') ? primaryPositionFor(item) : item[property]
			return valueMatch(propertyToCompare, value)
		})
	}


	setSearchQuery (value) {
		if (value.length > 0) {
			this.setState({searchQuery: value})
		} else {
			this.setState({searchQuery: null})
		}
	}

	render () {
		const { filter, searchQuery } = this.state
		const { data, columns, rows, filters, classes } = this.props

		return (
			<section className='section-with-sidebar'>
				<div className='sidebar'>
					<ListFilters
						activeFilter={filter.value}
						searchQuery={searchQuery}
						setSearchQuery={this.setSearchQuery.bind(this)}
						filterSelected={this.setFilter.bind(this)}
						filters={filters} />
				</div>

				<div className='main'>
					<Table
						data={this.getFilteredData()}
						columns={columns}
						classes={classes}>
							{this.props.children}
					</Table>
				</div>
			</section>
		)
	}
}

FilteredTable.propTypes = {
	data: PropTypes.array.isRequired,
	columns: PropTypes.array.isRequired,
	filters: PropTypes.array.isRequired,
	searchParameter: PropTypes.string.isRequired,
	onDataFiltered: PropTypes.func,
	classes: PropTypes.string
}

export default FilteredTable

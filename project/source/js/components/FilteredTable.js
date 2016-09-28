import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';
import {Table} from 'reactable'

import Icon from './Icon'

import { primaryPositionFor } from '../helpers/PlayerListUtils'
import { valueMatch } from '../helpers/arrayUtils'
import { stringMatch } from '../helpers/stringUtils'
import { createHeaderRow, createRows } from '../helpers/tableUtils'

import ListFilters from './ListFilters'

import '../../stylesheets/components/filtered-table.scss'

class FilteredTable extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filter: 'batter',
			sort: {
				column: 'rank',
				direction: 1
			},
			searchQuery: null
		}
	}

	setFilter (property, id) {
		this.table.filterBy( id )
		this.onFilter( id )
	}

	onFilter (filter) {
		const { onFilter } = this.props

		this.setState({ filter })

		if (onFilter) onFilter(filter)
	}

	onSort ( sort ) {
		this.setState({ sort } )

	}

	setSearchQuery (value) {
		this.searchQuery = value
		this.table.filterBy( 'name' )
	}

	getFilters () {

		const { filters, searchKey } = this.props
		const { filter, sort } = this.state

		const tableFilters = filters.map( filter => {
			const {column, filterFunction} = filter
			return {column, filterFunction}
		})

		const searchFilter = {
			column: searchKey,
			filterFunction: (contents, filter) => {
				if (filter !== searchKey) return
				return this.getSearchMatch(contents)
			}
		}

		return [...tableFilters, searchFilter]

	}

	getSearchMatch( string ) {
		const searchQuery = this.searchQuery.toLowerCase()
		// console.log(string)
		const stringQuery = string ? string.toLowerCase() : null
		return valueMatch(stringQuery, searchQuery, false)
	}

	render () {
		const { filter, searchQuery } = this.state
		const { data, columns, rows, filters } = this.props

		const table = this.renderTable()
		const loader = true ? this.renderLoader() : null

		return (
			<section className='filtered-table section-with-sidebar'>
				<div className='sidebar'>
					<ListFilters
						activeFilter={filter.value}
						searchQuery={searchQuery}
						setSearchQuery={this.setSearchQuery.bind(this)}
						filterSelected={this.setFilter.bind(this)}
						filters={filters} />
				</div>

				<div className='main'>
					{table}
				</div>
			</section>
		)
	}

	renderLoader () {
		return (
			<div className='loading active'>
				<Icon type={'preloader'} width={50} height={50} />
			</div>
		)
	}

	renderTable () {
		const { data, columns, className, sortingFunctions, rowClassFunction } = this.props
		const { filter, sort } = this.state
		const filters = this.getFilters()

		return (
			<Table
				ref={(ref) => this.table = ref}
				className={className}
				sortable={sortingFunctions}
				filterable={filters}
				defaultSort={sort}
				filterBy={filter}
				onFilter={ this.onFilter.bind(this) }
				onSort={ this.onSort.bind(this) }
				hideFilterInput >
					{ createHeaderRow(columns) }
					{ createRows(data, columns, rowClassFunction) }
			</Table>
		)
	}
}

FilteredTable.propTypes = {
	data: PropTypes.array.isRequired,
	columns: PropTypes.array.isRequired,
	filters: PropTypes.array.isRequired,
	preFilter: PropTypes.object,
	searchKey: PropTypes.string.isRequired,
	onDataFiltered: PropTypes.func,
	className: PropTypes.string,
	rowClassFunction: PropTypes.func
}

export default FilteredTable
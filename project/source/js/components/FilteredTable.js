import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';
import { Table } from 'reactable-cacheable'

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
		this.currentFilter = 'batter'
		this.currentSort = {
			column: 'rank',
			direction: 1
		}
		
		this.state = {
			searchQuery: null
		}
	}

	setFilter (property, id) {
		this.table.filterBy( id )
		this.onFilter( id )
	}

	onFilter (filter) {
		const { onFilter } = this.props

		this.currentFilter = filter

		if (onFilter) onFilter(filter)
	}

	onSort ( sort ) {
		this.currentSort = sort
	}

	setSearchQuery (value) {
		this.setState({searchQuery: value})
		if (value) {
			this.table.filterBy( 'name' )
		} else {
			this.table.filterBy( this.currentFilter )
		}
	}

	getFilters () {
		const { filters, searchKey } = this.props
		if (!filters) return

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
		const searchQuery = this.state.searchQuery.toLowerCase()
		// console.log(string)
		const stringQuery = string ? string.toLowerCase() : null
		return valueMatch(stringQuery, searchQuery, false)
	}

	getRows (data, columns, rowClassFunction) {
		// if (!this.rows) {
		// 	this.rows = createRows(data, columns, rowClassFunction)
		// }
		// return this.rows
		return createRows(data, columns, rowClassFunction)
	}

	render () {
		const { searchQuery } = this.state
		const { data, columns, rows, filters } = this.props

		const table = this.renderTable()
		const loader = true ? this.renderLoader() : null

		const currentFilter = this.currentFilter

	
		return (
			<section className='filtered-table section-with-sidebar'>
				<div className='sidebar'>
					<ListFilters
						activeFilter={currentFilter}
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
		const filters = this.getFilters()

		const headers = createHeaderRow(columns)
		const rows = this.getRows(data, columns, rowClassFunction)
	
		return (
			<Table
				ref={(ref) => this.table = ref}
				className={className}
				sortable={sortingFunctions}
				filterable={filters}
				defaultSort={this.currentSort}
				filterBy={this.currentFilter}
				onSort={ this.onSort.bind(this) }
				onFilter={ this.onFilter.bind(this) }
				hideFilterInput >
					{headers}
					{rows}
			</Table>
		)
	}
}
				
// { rows }
					// 

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
import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';
import { Table } from 'reactable-cacheable'

import Icon from './Icon'

import { valueMatch } from '../helpers/arrayUtils'
import { createHeaderRow, createRows } from '../helpers/tableUtils'

import ListFilters from './ListFilters'

import '../../stylesheets/components/filtered-table.scss'

class FilteredTable extends Component {
	constructor(props) {
		super(props)
		
		this.state = {
			searchQuery: null,
			filter: 'batter',
			sort: {
				column: props.defaultSort,
				direction: 1
			}
		}
	}

	shouldComponentUpdate (nextProps, nextState) {
		const serializedThisProps = JSON.stringify(this.props)
		const serializedNextProps = JSON.stringify(nextProps)
		const serializedThisState = JSON.stringify(this.state)
		const serializedNextState = JSON.stringify(nextState)
		return (serializedThisProps !== serializedNextProps) || (serializedThisState !== serializedNextState)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.defaultSort && (!this.props.sort || (nextProps.defaultSort !== this.props.sort.column))) {
			this.setState({
				sort: {
					column: nextProps.defaultSort,
					direction: this.state.sort.direction
				}
			})
		}
	}

	componentDidUpdate(prevProps, prevState) {
		console.log(this.props.data)
		this.table.sortBy(this.state.sort)
	}

	setFilter (property, id) {
		this.table.filterBy( id )
		this.onFilter( id )
	}

	onFilter (filter) {
		const { onFilter } = this.props

		this.setState({filter})

		if (onFilter) onFilter(filter)
	}

	onSort ( sort ) {
		const { data } = this.props
		this.setState({
			sort	
		})
	}

	setSearchQuery (value) {
		const { filter } = this.state

		this.setState({searchQuery: value})
		if (value) {
			this.table.filterBy( 'name' )
		} else {
			this.table.filterBy( filter )
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
		const stringQuery = string ? string.toLowerCase() : null
		return valueMatch(stringQuery, searchQuery, false)
	}

	getRows (data, columns, rowClassFunction) {
		return createRows(data, columns, rowClassFunction)
	}

	render () {
		const { searchQuery, filter } = this.state
		const { filters } = this.props

		const table = this.renderTable()
		const loader = true ? this.renderLoader() : null

		return (
			<section className='filtered-table section-with-sidebar'>
				<div className='sidebar'>
					<ListFilters
						activeFilter={filter}
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

		const headers = createHeaderRow(columns)
		const rows = this.getRows(data, columns, rowClassFunction)

		return (
			<Table
				ref={(ref) => this.table = ref}
				className={className}
				sortable={sortingFunctions}
				filterable={filters}
				defaultSort={sort}
				filterBy={filter}
				onSort={ this.onSort.bind(this) }
				onFilter={ this.onFilter.bind(this) }
				hideFilterInput >
					{headers}
					{rows}
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
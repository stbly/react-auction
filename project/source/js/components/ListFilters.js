import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import '../../stylesheets/components/list-filters.scss'

class ListFilters extends Component {
	constructor(props) {
		super(props)
		this.state = {
			searchValue: null
		}
	}

	setSearchQuery (e) {
		const searchValue = e.target.value;
		this.setState({searchValue});

		if (this.props.setSearchQuery) {
			this.props.setSearchQuery(searchValue);
		}
	}

	filterSelected (property, value) {
		if (this.props.filterSelected) {
			this.props.filterSelected(property, value)
		}
	}

	getButtonClass (buttonValue, buttonType, className=null) {
		return classNames('list-filter', buttonValue, buttonType, className, {'active': this.props.activeFilter === buttonValue})
	}

	getSearchValue () {
		return this.props.searchQuery;
	}

	getFilters () {
		return this.props.filters.map( (filter,index) => {
			const { text, value, property, className} = filter
			const filterList = (e) => this.filterSelected(property, value)
			return (
				<button
					className={this.getButtonClass(value, property, className)}
					key={index}
					data-param={filter.property}
					data-value={filter.value}
					onClick={filterList} >
						{text || value}
				</button>
			)
		})
	}

	render () {
		return (
			<div className='list-filters'>
				<input
					className='list-filter'
					type='text'
					onChange={this.setSearchQuery.bind(this)}
					placeholder='Search'
					value= {this.getSearchValue()} />

				{this.getFilters()}

			</div>
		)
	}
}

ListFilters.propTypes = {
	activeFilter: PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	searchQuery: PropTypes.string,
	setSearchQuery: PropTypes.func,
	filterSelected: PropTypes.func,
	filters: PropTypes.array.isRequired
}

export default ListFilters;

import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'


class ListFilters extends Component {
	constructor(props) {
		super(props)
		this.state = {
			searchValue: null
		}
	}

	setSearchQuery (e) {
		var searchValue = e.target.value;
		this.setState({searchValue});

		if (this.props.setSearchQuery) {
			this.props.setSearchQuery(searchValue);
		}
	}

	filterSelected (e) {

		if (this.props.filterSelected) {
			this.props.filterSelected(e)
		}
	}

	getButtonClass (buttonValue, buttonType, className=null) {
		return classNames('player-list-filter', buttonValue, buttonType, className, {'active': this.props.activeFilter === buttonValue})
	}

	getValue () {
		return this.props.searchQuery;
	}


	getFilters () {

		if (!this.props.filters) {
			return;
		}
		var _this = this;
		return this.props.filters.map( (filter,index) => {
			var text = filter.text || filter.value;
			return <button
						className={_this.getButtonClass(filter.value, filter.property, filter.className)}
						key={index}
						data-param={filter.property}
						data-value={filter.value}
						onClick={_this.filterSelected.bind(_this)} >
							{text}
					</button>
		})
	}

	render () {
		return (
			<div className='player-lists-filters'>

				<input
					className='player-list-filter'
					type='text'
					onChange={this.setSearchQuery.bind(this)}
					placeholder='Search'
					value= {this.getValue()} />

				{this.getFilters()}

			</div>
		)
	}
}

export default ListFilters;

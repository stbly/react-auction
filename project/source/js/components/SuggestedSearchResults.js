import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/search-results.scss'

class SuggestedSearchResults extends Component {
	constructor (props) {
		super(props)
		this.state = {
			activeResult: null
		}
	}

	componentDidMount () {
		var initialSelectedValue;
		if (this.props.results) {
			initialSelectedValue = this.props.results[0].value;
			this.setActiveItem(initialSelectedValue);
		}
	}

	componentWillReceiveProps (nextProps) {
		var initialSelectedValue;
		if (nextProps.results) {
			initialSelectedValue = nextProps.results[0].value;
			this.setActiveItem(initialSelectedValue);
		}

	}

	handleMouseOver (e) {
		var activeResult = e.target.getAttribute('data-item-name');
		this.setActiveItem(activeResult)
	}

	setActiveItem (activeResult) {
		this.setState({activeResult: activeResult});
		if (this.props.activeItemWasUpdated) {
			this.props.activeItemWasUpdated(activeResult);
		}
	}

	selectItem (e) {
		// console.log('select item',this.state.activeResult);
		if (this.props.resultWasSelected) {
			this.props.resultWasSelected(this.state.activeResult);
		}
	}

	getSearchResults () {
		var el = null;

		var liItems;

		var _this = this;

		if(this.props.results) {
			liItems = this.props.results.map( result => {

				var itemClass = classNames({'selected': result.value === _this.state.activeResult});

				var el =
					<li key={result.value}
						className={itemClass}
						onMouseOver={_this.handleMouseOver.bind(_this)}
						onClick={_this.selectItem.bind(_this)}
						data-item-name={result.value}>
							{result.value}
					</li>

				return el
			});
		}

		if (this.props.results) {
			var classes = classNames('search-results', {'active':this.props.results.length > 0});
			el = <ul className={classes}>
				{liItems}
			</ul>
		}
		return el;
	}


	render () {
		return (
			<div className='suggested-search-results'>
				{this.getSearchResults()}
			</div>
		)
	}
}

SuggestedSearchResults.propTypes = {

}

export default SuggestedSearchResults;

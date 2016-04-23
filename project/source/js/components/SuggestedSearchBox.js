import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import ValueInput from './ValueInput'
import SuggestedSearchResults from './SuggestedSearchResults'
import '../../stylesheets/components/suggested-search.scss'

class SuggestedSearchBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSearching: null,
			searchValue: ''
		}
	}

	handleEditStart (dispatcher) {
		console.log('handleEditStart')
		this.setState({isSearching: true})
		this.setState({currentEditElement: dispatcher})
		this.focusElement();

		if (this.props.didStartEditing) {
			this.props.didStartEditing();
		}
	}

	componentWillReceiveProps (nextProps) {
		console.log('componentWillReceiveProps')
	}

	handleSearchValueUpdate (value) {
		// console.log('handleSearchValueUpdate')
		this.setState({searchValue: value})
	}

	handleSearchValueChange (value) {
		// console.log('handleSearchValueChange')
		// console.log(this,'handleSearchValueChange()')
		this.setSearchValue();
	}

	handleKeyPress (e) {
		// console.log(e.key);
	}

	getSearchQueryResults () {
		var list = this.props.list,
			searchValueString = this.state.searchValue.toLowerCase(),
			queryProperty = this.props.queryProperty,
			_this = this,
			matchingValues;
			if (searchValueString.length >= 3) {
				matchingValues = list.filter(function (selection) {
					var selectionValue = queryProperty ? selection[queryProperty].toLowerCase() : selection.toLowerCase();
					var eachWord = selectionValue.split(' '),
						valueMatch;
					// console.log(selectionValue)

					for(var i=0; i<eachWord.length; i++) {
						if (eachWord[i].indexOf(searchValueString) === 0 || selectionValue.indexOf(searchValueString) === 0) {
							valueMatch = true;
						}
					}

					var valueAlreadyChosen,	valueAlreadyChosenException;

					if (!_this.props.inclusive) {
						valueAlreadyChosen = selection.isSelected;
						var currentSelection = _this.props.value;
						valueAlreadyChosenException = currentSelection ? (selectionValue === _this.props.value.toLowerCase()) : false;
					}

					return valueMatch && (!valueAlreadyChosen || valueAlreadyChosenException);
				});

				var iterator = 0,
				// var selectIndex = this.get('selectIndex');

				matchingValues = matchingValues.map(function (selection) {
					iterator++;
					var highlighted = iterator === 1;//selectIndex;
					return {
						value: selection[queryProperty] || selection,
						highlighted: highlighted
					};
				});

				if (matchingValues.length === 0){
					matchingValues = null;
				}
			}

		return matchingValues;
	}

	checkForPlayerInList (selectionValue) {
		var foundPlayer = null,
			queryProperty = this.props.queryProperty;

		this.props.list.forEach(function (selection) {
			var query = queryProperty ? selection[queryProperty] : selection;
			if (query === selectionValue) {
				foundPlayer = query;
			}
		});
		return foundPlayer;
	}

	updateActiveSearchItem (item) {
		// console.log('active search item',item)
		this.activeSearchItem = item;
	}

	suggestedSearchItemSelected (value) {
		// console.log('search item isSelected:', value);
		// console.log(this,'suggestedSearchItemSelected()')
		this.setState({searchValue: value});
		this.setSearchValue(value);
	}

	setSearchValue (value) {
		console.log('!!!!!!!!!!!!!!!!!!! setSearchValue',value)

		console.log('set search value:',value)
		// console.log('setSearchValue()')
		this.setState({isSearching:false})
		this.setState({currentEditElement:null})
		this.setState({searchValue:''})

		var selectionValue = this.checkForPlayerInList(value);
		if (!selectionValue) {
			selectionValue = this.activeSearchItem;
		}

		selectionValue = this.checkForPlayerInList(selectionValue);

		if (this.props.valueDidChange) {
			this.props.valueDidChange(selectionValue);
		}
	}

	getValue () {
		var value = this.state.searchValue;
		// if (this.state.isSearching) {
			console.log('that is true')

			if (!value) {
				value = this.props.value;
			}
		// }
		console.log('we have a value damn it', value)
		return value;
	}

	getPlaceholder () {
		console.log('getPlaceholder()',this.props.value,this.props.placeholder)
		return this.props.value || this.props.placeholder;
	}

	focusElement () {
		this.valueInput.setFocus('in');
	}

	getSearchResults () {
		var el;
		if (this.state.isSearching) {
			el = <SuggestedSearchResults
				results={this.getSearchQueryResults()}
				resultWasSelected={this.suggestedSearchItemSelected.bind(this)}
				activeItemWasUpdated={this.updateActiveSearchItem.bind(this)} />
		}
		return el
	}

	reset () {
		this.activeSearchItem = null;
		this.setState({searchValue: ''})
	}

	render () {
		return (
			<span className='suggested-search-box'>

				<ValueInput
					ref={(ref) => this.valueInput = ref}
					type='text'
					min={this.props.min}
					max={this.props.max}
					didStartEditing={this.handleEditStart.bind(this)}
					currentEditElement={this.state.currentEditElement}
					classNames={this.props.classNames}
					placeholder={this.getPlaceholder()}
					value = {this.getValue()}
					keyWasPressed={this.handleKeyPress.bind(this)}
					valueDidUpdate = {this.handleSearchValueUpdate.bind(this)}
					valueDidChange = {this.handleSearchValueChange.bind(this)} />

				{this.getSearchResults()}
			</span>
		)
	}
}

export default SuggestedSearchBox;

import React, { Component, PropTypes } from 'react'
import { Router, Route, Link, browserHistory } from 'react-router'
import classNames from 'classnames';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import '../../stylesheets/components/value-input.scss'

class ValueInput extends Component {
	constructor (props) {
			super(props)
			this.state = {
				showValue: false,
				inputValue: ''
			}
	}

	componentWillReceiveProps (nextProps) {
		var showValue = nextProps.value > 0;
		if (nextProps.currentEditElement === this) {
			showValue = false;
		}
		// console.log(startEditingValue);
		this.setState({showValue: showValue});
		this.setState({inputValue: nextProps.value});
	}

	componentDidMount() {
		this.setState({showValue: this.props.value > 0});
		this.setState({inputValue: this.props.value});
	}

	componentDidUpdate() {
		// console.log(this.state )
	}

	updateInputValue (e) {
		this.setState({inputValue: e.target.value});
		console.log(e.target.value);
	}

	changeValue (e) {
		console.log('chnge value');
		if (e.key === 'Enter' || e.type === 'blur') {
			this.setState({showValue: this.state.inputValue > 0});
			console.log(this.state)
			e.target.blur();
			if (this.props.valueDidChange) {
				this.props.valueDidChange(this.state.inputValue, this);
			}
		}
	}

	toggleShowValue (e) {
		var bool = this.state.showValue;
		this.setState({showValue: !bool});
		if (bool) {
			this.handleEditStart();
		}
	}

	handleEditStart () {
		if (this.props.didStartEditing) {
			this.props.didStartEditing(this);
		}
	}

	getClassNames () {
		var classes = ['value-input']

		if (this.props.classNames) {
			this.props.classNames.forEach(function (className) {
				classes.push(className)
			});

		}

		return classNames(classes);;
	}

	getInputView () {
		var el;

		if (this.state.showValue) {
			el = <td className='can-edit'>
					<span className={this.getClassNames()}
						onClick={this.toggleShowValue.bind(this)}>
						{this.props.value}
					</span>
				</td>
		} else {
			el = <td className='can-edit'>
					<input
						type="number"
						className={this.getClassNames()}
						onClick={this.handleEditStart.bind(this)}
						onChange={this.updateInputValue.bind(this)}
						onBlur={this.changeValue.bind(this)}
						onKeyPress={this.changeValue.bind(this)}
						value={this.state.inputValue}>
					</input>
				</td>
		}
		return el
	}

	render () {
		return (
			this.getInputView()
		)
	}
}

ValueInput.propTypes = {

}

export default ValueInput;

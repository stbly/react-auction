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

	componentDidMount() {
		this.setState({showValue: this.valueExists(this.props.value)});
		this.setState({inputValue: this.props.value});
	}

	componentWillReceiveProps (nextProps) {
		// console.log(nextProps);
		var showValue = this.valueExists(nextProps.value);
		// console.log(showValue, nextProps.currentEditElement === this);

		if (nextProps.currentEditElement === this) {
			showValue = false;
		}
		// console.log(startEditingValue);
		// console.log('showValue:',showValue);
		this.setState({showValue: showValue});
		this.setState({inputValue: nextProps.value});
	}

	updateInputValue (e) {
		this.setState({inputValue: e.target.value});
		// console.log(e.target.value);
		if (this.props.valueDidUpdate) {
			this.props.valueDidUpdate(e.target.value)
		}
	}

	getValue () {
		return this.state.inputValue || this.props.value;
	}

	valueExists (value) {
		if (value) {
			return value > 0 || value.length > 0;
		} else {
			return null;
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
		// console.log('handleEditStart 2');
		this.valueChanged = false

		if (this.state.isEditing) {
			return;
		}
		// console.log('is editing false')
		this.setState({
			isEditing:true,
			startValue: this.getValue()
		})
		if (this.props.didStartEditing) {
			this.props.didStartEditing(this);
		}
	}

	handleKeyPress (e) {
		if (e.key === 'Enter') {
			this.changeValue(e);
		} else {
			if (this.props.keyWasPressed) {
				this.props.keyWasPressed(e);
			}
		}

	}

	changeValue (e) {
		var blurIsAllowed = (e.type === 'blur' && !this.props.cancelBlur)
		if (e.key === 'Enter' || blurIsAllowed && !this.valueChanged) {
			// console.log('sending value',this.getValue())
			// this.value = this.getValue()
			this.valueChanged = true
			var value = this.state.inputValue
			this.setState({showValue: true});
			this.setState({isEditing: false})
			// console.log(this.state)
			e.target.blur();

			if (value != this.state.startValue) {
				if (this.props.valueDidChange) {
					this.props.valueDidChange(this.state.inputValue, this);
				}
			}
		}
	}

	getClassNames (classes) {
		if (this.props.classNames) {
			this.props.classNames.forEach(function (className) {
				classes.push(className)
			});

		}
		return classNames(classes);;
	}

	startEditing() {
		this.forceEdit = true;
		this.setState({'showValue':false})
	}

	setFocus (state) {
		if (state === 'in') {
			this.el.focus();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.isEditing) {
			// console.log('force edit!');
			this.forceEdit = false;
			this.setFocus('in');
		}
	}

	getInputView () {
		var el;

		if (this.state.showValue) {
			el = <span className={this.getClassNames(['value-display'])}
					ref={(ref) => this.el = ref}
					onClick={this.toggleShowValue.bind(this)}>
					{this.getValue()}
				</span>
		} else {
			if (this.props.type === 'textarea') {
				el = <textarea className={this.getClassNames(['value-select'])}
						ref={(ref) => this.el = ref}
						min={this.props.min}
						max={this.props.max}
						placeholder={this.props.placeholder}
						onClick={this.handleEditStart.bind(this)}
						onFocus={this.handleEditStart.bind(this)}
						onChange={this.updateInputValue.bind(this)}
						onBlur={this.changeValue.bind(this)}
						onKeyPress={this.handleKeyPress.bind(this)}
						value={this.state.inputValue}>
					</textarea>
			} else {
				el = <input className={this.getClassNames(['value-select'])}
						ref={(ref) => this.el = ref}
						type={this.props.type || 'number'}
						min={this.props.min}
						max={this.props.max}
						placeholder={this.props.placeholder}
						onClick={this.handleEditStart.bind(this)}
						onFocus={this.handleEditStart.bind(this)}
						onChange={this.updateInputValue.bind(this)}
						onBlur={this.changeValue.bind(this)}
						onKeyPress={this.handleKeyPress.bind(this)}
						value={this.state.inputValue}>
					</input>

			}
		}
		return el
	}

	render () {
		var className = classNames('value-input',{'showing-input': this.state.isEditing})
		return (
			<span className={className}>
				{this.getInputView()}
			</span>
		)
	}
}

ValueInput.propTypes = {
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	type: React.PropTypes.string,
	min: React.PropTypes.number,
	max: React.PropTypes.number,
	placeholder: React.PropTypes.string,
	didStartEditing: React.PropTypes.func,
	valueDidChange: React.PropTypes.func,
	valueDidUpdate: React.PropTypes.func,
	keyWasPressed: React.PropTypes.func,
	cancelBlur: React.PropTypes.func
}

export default ValueInput;

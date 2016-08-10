import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import '../../stylesheets/components/input.scss'

class Input extends Component {
	constructor (props) {
		super(props)
		this.state = {
			inputValue: '',
			startValue: '',
			isEditing: false
		}
	}

	componentDidMount() {
		this.setState({inputValue: this.props.value});
		this.allowChange = true
	}

	componentWillReceiveProps (nextProps) {
		this.setState({inputValue: nextProps.value});
	}

	updateInputValue (e) {
		this.setState({inputValue: e.target.value});
		if (this.props.valueDidUpdate) {
			this.props.valueDidUpdate(e.target.value)
		}
	}

	getValue () {
		return this.state.inputValue || this.props.value;
	}

	handleEditStart () {
		if (this.state.isEditing) {
			return;
		}

		this.allowChange = true;

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
			e.target.blur();
		} else {
			if (this.props.keyWasPressed) {
				this.props.keyWasPressed(e);
			}
		}
	}

	handleBlur (e) {
		this.attemptChangeValue(e)
	}

	attemptChangeValue(e) {
		const target = e.nativeEvent.target
		const changeAllowed = this.allowChange
		let value = this.state.inputValue
		if (changeAllowed) {
			this.allowChange = false
			const min = target.getAttribute('min')
			const max = target.getAttribute('max')

			if (min || max) {
				value = Number(value)
				if (min && value < min) (value = min)
				if (max && value > max) (value = max)
			}

			if (value != this.state.startValue) {
				this.changeValue(value)
			}
		}
		this.stopEditing()
	}

	changeValue (newValue) {
		this.allowChange = true
		if (this.props.valueDidChange) {
			this.props.valueDidChange(newValue, this);
		}
	}

	startEditing() {
		//TO DO: figure out why this.forceEdit exists and see if we can turn this into a state property
		this.forceEdit = true;
	}

	stopEditing() {
		this.setState({isEditing: false})
		if (this.props.didStopEditing) {
			this.props.didStopEditing()
		}
	}

	setFocus (state) {
		if (state === 'in') {
			this.el.focus();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.isEditing) {
			this.forceEdit = false;
			this.setFocus('in');
		}
	}

	render () {
		return (
			<span className='input'>
				{this.renderValueInput()}
			</span>
		)
	}

	renderValueInput () {
		switch (this.props.type) {
			case 'textarea':
				return this.renderTextArea()
			default:
				return this.renderInput()
		}
	}

	renderInput () {
		const valueExists = this.state.inputValue ? this.state.inputValue.length > 0 : false
		const classes = classNames(this.props.classNames, 'value-select', {'has-value': valueExists})
		return (
			<input className={classes}
				ref={(ref) => this.el = ref}
				type={this.props.type || 'number'}
				min={this.props.min}
				max={this.props.max}
				step={this.props.step}
				placeholder={this.props.placeholder}
				onClick={this.handleEditStart.bind(this)}
				onFocus={this.handleEditStart.bind(this)}
				onChange={this.updateInputValue.bind(this)}
				onBlur={this.handleBlur.bind(this)}
				onKeyPress={this.handleKeyPress.bind(this)}
				value={this.state.inputValue}>
			</input>
		)
	}

	renderTextArea () {
		const classes = classNames(this.props.classNames, 'value-select', {'has-value': this.state.inputValue.length > 0})
		return (
			<textarea className={classes}
				ref={(ref) => this.el = ref}
				min={this.props.min}
				max={this.props.max}
				placeholder={this.props.placeholder}
				onClick={this.handleEditStart.bind(this)}
				onFocus={this.handleEditStart.bind(this)}
				onChange={this.updateInputValue.bind(this)}
				onBlur={this.handleBlur.bind(this)}
				onKeyPress={this.handleKeyPress.bind(this)}
				value={this.state.inputValue}>
			</textarea>
		)
	}
}

Input.propTypes = {
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	classNames: React.PropTypes.string,
	type: React.PropTypes.string,
	step: React.PropTypes.number,
	min: React.PropTypes.number,
	max: React.PropTypes.number,
	placeholder: React.PropTypes.string,
	didStartEditing: React.PropTypes.func,
	didStopEditing: React.PropTypes.func,
	valueDidChange: React.PropTypes.func,
	valueDidUpdate: React.PropTypes.func,
	keyWasPressed: React.PropTypes.func
}

export default Input;

import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';

import Input from './Input'

import '../../stylesheets/components/input-toggle.scss'

class InputToggle extends Input {
	constructor (props) {
		super(props)
		this.state = {
			showValue: false,
			inputValue: '',
			startValue: ''
		}
	}

	componentDidMount() {
		super.componentDidMount()
		this.setState({showValue: this.shouldShowValue(this.props.value)});
	}

	componentWillReceiveProps (nextProps) {
		super.componentWillReceiveProps(nextProps)

		if(nextProps.value !== this.props.value) {
			let showValue = this.shouldShowValue(nextProps.value);

			if (nextProps.currentEditElement === this) {
				showValue = this.state.isEditing ? false : showValue;
				console.log(this.state.isEditing)
			}

			this.setState({showValue: showValue});
		}
	}

	shouldShowValue (value) {
		if (value) {
			return value > 0 || value.length > 0;
		} else {
			return null;
		}
	}

	toggleShowValue (e) {
		const bool = this.state.showValue;
		this.setState({showValue: !bool});
		if (bool) {
			this.handleEditStart();
		}
	}

	handleBlur (e) {
		super.handleBlur(e)
		this.setState({showValue: this.shouldShowValue(this.state.inputValue)})
	}

	startEditing() {
		super.startEditing()
		this.setState({showValue: false})
	}

	render () {
		const className = classNames('input-toggle', {'showing-input': this.state.isEditing})
		const element = this.state.showValue ? this.renderValueDisplay() : this.renderValueInput()
		return (
			<span className={className}>
				{element}
			</span>
		)
	}

	renderValueDisplay () {
		const classes = classNames(this.props.classNames, 'value-display')
		return (
			<span
				className={classes}
				ref={(ref) => this.el = ref}
				tabIndex="0"
				onFocus={this.toggleShowValue.bind(this)}
				onClick={this.toggleShowValue.bind(this)}>
					{this.getValue()}
			</span>
		)
	}
}

export default InputToggle;

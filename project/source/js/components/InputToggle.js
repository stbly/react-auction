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
		const { value, allowZero } = this.props
		super.componentDidMount()
		this.setState({showValue: this.shouldShowValue( value, allowZero )});
	}

	componentWillReceiveProps (nextProps) {
		const { value, allowZero, currentEditElement } = nextProps

		super.componentWillReceiveProps(nextProps)

		if(value !== this.props.value) {
			let showValue = this.shouldShowValue(value, allowZero);

			if (currentEditElement === this) {
				showValue = this.state.isEditing ? false : showValue;
			}

			this.setState({showValue: showValue});
		}
	}

	shouldShowValue (value, allowZero) {
		if (value || allowZero) {
			return value > 0 || value.length > 0 || allowZero;
		} else {
			return false;
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
		const { allowZero } = this.props
		const { inputValue } = this.state
		super.handleBlur(e)
		this.setState({showValue: this.shouldShowValue(inputValue, allowZero)})
	}

	startEditing() {
		super.startEditing()
		this.setState({showValue: false})
	}

	render () {
		const { disabled } = this.props;
		const classes = classNames('input-toggle', {'showing-input': this.state.isEditing && !disabled}, {'is-disabled': disabled})
		const element = (!this.state.showValue && !disabled) ? this.renderValueInput() : this.renderValueDisplay()
		return (
			<span className={classes}>
				{element}
			</span>
		)
	}

	renderValueDisplay () {
		const { className, disabled } = this.props
		const classes = classNames(className, 'value-display')
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

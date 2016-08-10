import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import * as userActions from '../redux/modules/user'
import {
	AWAITING_AUTH_RESPONSE,
	LOGGED_IN,
	ANONYMOUS } from '../redux/modules/user'

import classNames from 'classnames';
import Input from './Input'
import Icon from './Icon'

import '../../stylesheets/components/login.scss'

class Login extends Component {
	constructor(props) {
		super(props)
		this.state = {
			username: '',
			password: ''
		}
	}

	componentWillReceiveProps (nextProps) {
		if (this.props.user.status === AWAITING_AUTH_RESPONSE && nextProps.user.status !== AWAITING_AUTH_RESPONSE) {
			this.setState({
				username:'',
				password:''
			})
		}
	}

	componentDidUpdate () {
		/*if (this.state.username && this.state.password) {
			this.attemptLogin()
		}*/
	}

	updateValue(type, value) {
		this.setState({
			[type]: value
		})
	}

	attemptLogin (e) {
		if (e) e.preventDefault()

		const {username, password} = this.state
		this.props.actions.attemptLogin(username, password)
		// this.setState({username: '', password: ''})
	}

	attemptLogout () {
		this.props.actions.attemptLogout()
	}

	isSubmitting () {
		return this.props.user.status === AWAITING_AUTH_RESPONSE
	}

	render () {

		const form = this.props.user.uid ? this.renderLogout() : this.renderLogin()
		const classes = classNames('login', {'logging-in': this.isSubmitting() })
		return (
			<div className={classes}>
				{form}
			</div>
		)
	}

	renderLogout () {
		return (
			<div>
				<span className='username'>{this.props.user.username}</span>
				<button onClick={this.attemptLogout.bind(this)}>Log Out</button>
			</div>
		)
	}

	renderLogin () {
		return (
			<form onSubmit={this.attemptLogin.bind(this)}>
				<Input
					type="text"
					placeholder="Username"
					value={this.state.username}
					valueDidChange={this.updateValue.bind(this,'username')} />
				<Input
					type="password"
					placeholder="Password"
					value={this.state.password}
					valueDidChange={this.updateValue.bind(this,'password')} />
				{this.renderSubmitButtonType()}
			</form>
		)
	}

	renderSubmitButtonType () {
		return this.isSubmitting() ? this.renderLoadingButton() : this.renderSubmitButton()
	}
	renderSubmitButton () {
		return(
			<input type='submit' value='Log In' />
		)
	}
	renderLoadingButton (){
		return (
			<button className='loading-button'>
				Log In
				<Icon
					type={'preloader'} />
			</button>
		)
	}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(userActions, dispatch)
    }
}

function mapStateToProps (state,ownProps) {
	var user = state.user || {}
	return {
		user
	};

	// return { ...state.players.lists };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)

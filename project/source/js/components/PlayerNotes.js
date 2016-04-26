import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

import ValueInput from './ValueInput'

import '../../stylesheets/components/player-notes.scss'

class PlayerNotes extends Component {
	constructor(props) {
		super(props)
		this.state = {
			expanded: false,
			animating: false
		}
	}

	notesWereUpdated (notes) {
		this.closeAfterUpdate = true;
		if (this.props.notesWereUpdated) {
			this.props.notesWereUpdated(notes)
		}
	}

	toggleExpansion () {
		if (this.state.animating) {
			return;
		}

		var isExpanded = this.state.expanded;

		if (!isExpanded) {
			setTimeout(this.focusTextField.bind(this), 500)
		}

		this.setState({expanded: !isExpanded})
	}

	focusTextField () {
		// console.log('focusTextField()')
		this.textInput.startEditing()
	}

	componentDidUpdate() {
		if (this.closeAfterUpdate) {
			this.closeAfterUpdate = false;
			// this.toggleExpansion()
		}
	}

	render () {
		var isExpanded = this.state.expanded;

		var classes = classNames('player-notes', {'expanded': isExpanded})

		return (
			<div className={classes}>
				<div className='fold'></div>
				<span className='preview'>{this.props.notes}</span>
				<h2>Player Notes</h2>

				<ValueInput type='textarea'
					ref={(ref) => this.textInput = ref}
					classNames={['player-notes-input']}
					value={this.props.notes}
					valueDidChange={this.notesWereUpdated.bind(this)} />
				<div className='expand-button' onClick={this.toggleExpansion.bind(this)}></div>
			</div>
        )
	}
}

PlayerNotes.propTypes = {
	notes: React.PropTypes.string,
	notesWereUpdated: React.PropTypes.func
}

export default PlayerNotes
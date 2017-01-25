import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

import InputToggle from './InputToggle'
import SuggestedSearchBox from './SuggestedSearchBox'
import '../../stylesheets/components/player-input.scss'

class PlayerInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			playerName: null,
			playerCost: null,
			playerTeam: null,
		}
	}

	componentDidUpdate () {
		// console.log(this.state);
		if (this.state.playerName && this.state.playerCost /*&& this.state.playerTeam*/) {
			this.handleSubmit();
		} else if (this.submitted) {
			this.submitted = false;
			this.playerInput.startEditing();
		}
	}

	toggleCostEditState (dispatcher) {
		const isEditingCost = this.state.isEditingCost
		this.setState({isEditingCost: !isEditingCost});
		if (!isEditingCost) {
			this.setState({currentEditElement: dispatcher})
		}
	}

	handleSubmit (e) {
		if (e) {
			e.preventDefault();
		}

		const {playerName, playerCost, playerTeam} = this.state
		const searchablePlayers = this.props.searchablePlayers;

		this.submitted = true;

		this.playerInput.reset();
		// this.teamInput.reset();


		if (!playerName || !playerCost /*|| !playerTeam*/) {

			console.log('not enough inputs');

		} else {

			this.setState({
				playerName: null,
				playerCost: '',
				playerTeam: null
			})
			
			let playerId;
			for (let key in searchablePlayers) {
			    // skip loop if the property is from prototype
			    if (searchablePlayers.hasOwnProperty(key)) {
			    	const currentPlayer = searchablePlayers[key].name.toLowerCase();
			    	if (currentPlayer === playerName.toLowerCase()) {
			    		playerId = searchablePlayers[key].id
			    		break;
			    	}
			    }
			}

			if (! playerId) {
				console.log('player not found');
			} else {
				if (this.props.playerEntered) {
					this.props.playerEntered(playerId, playerCost, playerTeam);
				}
			}
		}

	}

	setCost (cost) {
		this.setState({isEditingCost: false})
		if (this.state.playerCost === cost) {
			return;
		}
		this.setState({currentEditElement: false})
		this.setState({playerCost: cost})
	}

	setPlayer (name) {
		if (this.state.playerName === name) {
			return;
		}
		if (name.length < 1) {
		   this.playerInput.startEditing();
		} else {
			this.setState({playerName: name});
		}
	}

	setTeam (name) {
		if (this.state.playerTeam === name) {
			return;
		}
		this.setState({playerTeam: name});
	}

	render () {
		const costContainerClasses = classNames('cost-container',{'is-editing':this.state.isEditingCost});

		return (
			<div className='player-input'>
				<form onSubmit={this.handleSubmit.bind(this)}>
					<SuggestedSearchBox
						ref={(ref) => this.playerInput = ref}
						list={this.props.searchablePlayers}
						queryProperty='name'
						classNames={'player-input-box'}
						placeholder='Input Player Name'
						value = {this.state.playerName}
						valueDidChange = {this.setPlayer.bind(this)} />

					<div className={costContainerClasses}>
						<InputToggle
							classNames={'dollar-amount player-input-box cost-input'}
							placeholder={'$'}
							min={0}
							max={99}
							didStartEditing={this.toggleCostEditState.bind(this)}
							didStopEditing={this.toggleCostEditState.bind(this)}
							currentEditElement={this.state.currentEditElement}
							value={this.state.playerCost}
							valueDidChange = {this.setCost.bind(this)} />
					</div>

					<input type='submit' className='player-input-box submit' value='Draft' />
				</form>
			</div>
		)
	}
}


//Add back in when teams feature is implemented
/*<SuggestedSearchBox
	ref={(ref) => this.teamInput = ref}
	list={this.props.searchableTeams}
	classNames={'player-input-box'}
	placeholder='Input Team Name'
	value = {this.state.playerTeam}
	valueDidChange = {this.setTeam.bind(this)} />*/

export default PlayerInput;

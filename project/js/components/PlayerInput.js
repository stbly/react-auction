import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import classNames from 'classnames';

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'

import ValueInput from './ValueInput'
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
		if (this.state.playerName && this.state.playerCost && this.state.playerTeam) {
			this.handleSubmit();
		} else if (this.submitted) {
			this.submitted = false;
			this.playerInput.focusElement();
		}
	}

	setCostEditState (dispatcher) {
		this.setState({isEditingCost: true});
		this.setState({currentEditElement: dispatcher})
	}

	handleSubmit (e) {
		if (e) {
			e.preventDefault();
		}

		var player = this.state.playerName,
			cost = this.state.playerCost,
			team = this.state.playerTeam,
			searchablePlayers = this.props.searchablePlayers;

		this.submitted = true;

		if (!player || !cost || !team) {

			console.log('not enough inputs');

		} else {

			var playerId;
			for (var key in searchablePlayers) {
			    // skip loop if the property is from prototype
			    if (searchablePlayers.hasOwnProperty(key)) {
			    	var currentPlayer = searchablePlayers[key].name.toLowerCase();
			    	if (currentPlayer === player.toLowerCase()) {
			    		playerId = searchablePlayers[key].id
			    		break;
			    	}
			    }
			}

			if (! playerId) {

				console.log('player not found');

			} else {
				if (this.props.playerEntered) {
					this.props.playerEntered(playerId, cost, team);
				}
			}
		}

		this.setState({
			playerName: null,
			playerCost: null,
			playerTeam: null
		})
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
		   this.playerInput.focusElement();
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
		var costContainerClasses = classNames('cost-container',{'is-editing':this.state.isEditingCost});
		return (
			<div className='player-input'>
				<form onSubmit={this.handleSubmit.bind(this)}>
					<SuggestedSearchBox
						ref={(ref) => this.playerInput = ref}
						list={this.props.searchablePlayers}
						queryProperty='name'
						classNames={['player-input-box']}
						placeholder='Input Player Name'
						value = {this.state.playerName}
						valueDidChange = {this.setPlayer.bind(this)} />

					<div className={costContainerClasses}>
						<ValueInput
							classNames={['dollar-amount','player-input-box','cost-input']}
							placeholder={'$'}
							min={'0'}
							max={'99'}
							didStartEditing={this.setCostEditState.bind(this)}
							currentEditElement={this.state.currentEditElement}
							value={this.state.playerCost}
							valueDidChange = {this.setCost.bind(this)} />
					</div>

					<SuggestedSearchBox
						ref={(ref) => this.teamInput = ref}
						list={this.props.searchableTeams}
						classNames={['player-input-box']}
						placeholder='Input Team Name'
						value = {this.state.playerTeam}
						valueDidChange = {this.setTeam.bind(this)} />

					<input type='submit' className='player-input-box submit' value='Select' />
				</form>
			</div>
		)
	}
}

export default PlayerInput;

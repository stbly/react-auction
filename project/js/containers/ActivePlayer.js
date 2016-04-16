import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import Player from '../components/Player'

// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { browserHistory } from 'react-router'


class ActivePlayer extends Component {
	constructor(props) {
		super(props)
	}

	getActivePlayer () {
		if (!this.props.activePlayer) {
			return <div></div>;
		}

		var type = this.props.activePlayer.type;
		var activePlayerClasses = classNames('active-player',type);
		var tableClasses = classNames('player-list',type);
		var categories = type === 'batter' ? this.props.battingCategories : this.props.pitchingCategories;
		return (
			<div className={activePlayerClasses}>
				<table className={tableClasses}>
					<tbody>
						<Player
							hideMetaInfo={true}
							player={this.props.activePlayer}
							categories={categories}/>
					</tbody>
				</table>
			</div>
		)
	}

	render () {
		return (
			this.getActivePlayer()
		)
	}
}

/*
function mapDispatchToProps(dispatch) {

}
*/

function mapStateToProps (state,ownProps) {
	return {
		activePlayer: state.players.activePlayer,
	};
}

export default connect(mapStateToProps)(ActivePlayer);

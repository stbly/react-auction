import React, { Component, PropTypes } from 'react'

import classNames from 'classnames';

class LeagueSettings extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='league-settings'>
				League Settings
			</div>
		)
	}
}

LeagueSettings.propTypes = {
    settings: PropTypes.object,
    teams: PropTypes.object,

}

export default LeagueSettings
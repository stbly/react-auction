import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';
import InputPlayerCost from './InputPlayerCost'

import '../../stylesheets/components/cell-player-cost.scss'


class CellPlayerCost extends Component {

	startEditing () {
		this.input.startEditing()
	}

	render () {
		const { cost, onCostChange } = this.props
		const hasCost = cost > 0
		const prefix = hasCost ? 'Drafted:' : null
		const classes = classNames('cell-player-cost', {'is-drafted': hasCost} )

		return (
			<div className={classes}
				onClick={this.startEditing.bind(this)}>
					{prefix}
					<InputPlayerCost
						ref={(ref) => this.input=ref }
						cost = {cost}
						onCostChange = {onCostChange} />
			</div>
		)
	}
}

CellPlayerCost.propTypes = {
	cost: PropTypes.number,
	onCostChange: PropTypes.func,
}

export default CellPlayerCost;
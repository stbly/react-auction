import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';

import IconButton from './IconButton'
import InputToggle from './InputToggle'

import '../../stylesheets/components/cell-player-rank.scss'

class CellPlayerRank extends Component {

	constructor(props) {
		super(props)
		this.state = {
			showOptions: false
		}
	}

	startEditing () {
		this.input.startEditing()
	}

	componentDidMount () {
		// console.log('mounted')
	}

	shouldComponentUpdate (nextProps, nextState) {
		// console.log(nextProps.cost !== this.props.cost)

		return (
			nextProps.player.rank !== this.props.player.rank ||
			nextProps.player.value !== this.props.player.value ||
			nextProps.player.isFavorited !== this.props.player.isFavorited ||
			this.props.showOptions !== nextState.showOptions
		)
	}

	handleMouseEnter () {
		this.setState({
			showOptions: true
		})
	}

	handleMouseLeave () {
		this.setState({
			showOptions: false
		})
	}

	handleIsDraftedClick (e) {
		const { player, handleIsDraftedClick, isAuctionLeague } = this.props
		if (handleIsDraftedClick) {
			const active = this.getDraftedButtonActive()
			const value = isAuctionLeague ? (active ? null : 0 ): !active

			handleIsDraftedClick(player.id, value)
		}
	}

	getDraftedButtonActive () {
		const { player, isAuctionLeague } = this.props
		return player.isDrafted && (!isAuctionLeague || (isAuctionLeague && player.cost === 0))
	}

render () {
		// console.log('updating')
		const { showOptions } = this.state
		const {
			player,
			isAuctionLeague } = this.props

		const { cost, onCostChange, disabled } = this.props
		const classes = classNames('cell-player-rank', {'show-menu': showOptions})

		return (
			<div
				className={classes}
				onMouseEnter={this.handleMouseEnter.bind(this)}
				onMouseLeave={this.handleMouseLeave.bind(this)}>
					<div className='rank'>
						{player.rank}
					</div>
					<div className='menu'>
						<IconButton
							toggleButton={this.handleIsDraftedClick.bind(this)}
							isActive={this.getDraftedButtonActive()}
							isDisabled={player.cost > 0}
							type={isAuctionLeague ? 'zero' : 'check'} />
					</div>
			</div>
		)
	}
}

CellPlayerRank.propTypes = {
	player: PropTypes.object,
	isAuctionLeague: PropTypes.bool
}

export default CellPlayerRank;

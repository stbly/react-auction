import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';

import IconButton from './IconButton'
import InputToggle from './InputToggle'

import '../../stylesheets/components/cell-player-name.scss'

class CellPlayerName extends Component {

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
			nextProps.player.name !== this.props.player.name || 
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

	handleInformationClick () {
		const { player, handleInformationClick } = this.props
		if (handleInformationClick) {
			handleInformationClick(player.id)
		}
	}

	handleIsDraftedClick (e) {
		const { player, handleIsDraftedClick, isAuctionLeague } = this.props
		if (handleIsDraftedClick) {
			const active = this.getDraftedButtonActive()
			const value = isAuctionLeague ? (active ? null : 0 ): !active

			handleIsDraftedClick(player.id, value)
		}

	}

	handleSleeperClick () {
		const { player, handleSleeperClick } = this.props
		if (handleSleeperClick) {
			handleSleeperClick(player.id)
		}

	}

	handleFavoriteClick () {
		const { player, handleFavoriteClick } = this.props
		if (handleFavoriteClick) {
			handleFavoriteClick(player.id)
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
		const classes = classNames('cell-player-name', {'show-menu': showOptions})
		
		return (
			<div 
				className={classes}
				onMouseEnter={this.handleMouseEnter.bind(this)}
				onMouseLeave={this.handleMouseLeave.bind(this)}>
					<div className='name'>
						{player.name}
					</div>
					<div className='menu'>
						<ul>
							<li>
								<IconButton
									toggleButton={this.handleFavoriteClick.bind(this)}
									isActive={player.isFavorited}
									type={'watch'} />
							</li>
							<li>
								<IconButton
									toggleButton={this.handleSleeperClick.bind(this)}
									isActive={player.isSleeper}
									type={'sleeper'} />
							</li>
							<li>
								<IconButton
									toggleButton={this.handleIsDraftedClick.bind(this)}
									isActive={this.getDraftedButtonActive()}
									isDisabled={player.cost > 0}
									type={isAuctionLeague ? 'zero' : 'check'} />
							</li>
						</ul>
					</div>
			</div>
		)
	}
}

CellPlayerName.propTypes = {
	cost: PropTypes.number,
	onCostChange: PropTypes.func,
	disabled: PropTypes.bool
}

export default CellPlayerName;
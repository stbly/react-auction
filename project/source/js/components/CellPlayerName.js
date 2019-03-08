import React, {Component, PropTypes} from 'react'
import classNames from 'classnames';

import IconButton from './IconButton'
import InputToggle from './InputToggle'

import '../../stylesheets/components/cell-player-name.scss'

class CellPlayerName extends Component {

	constructor(props) {
		super(props)
		this.state = {
			showOptions: false,
			paVal: null,
			temp: null
		}
	}

	startEditing () {
		this.input.startEditing()
	}

	componentDidMount () {
	}

	componentWillReceiveProps (nextProps, nextState) {
		const { paVal, temp } = this.state
		if (paVal && paVal !== nextProps.player.stats.PA) {
			this.setState({
				paVal: nextProps.player.stats.PA
			})
		}

		if (temp && temp !== nextProps.player.temp) {
			this.setState({
				temp: nextProps.player.temp
			})
		}
	}

	shouldComponentUpdate (nextProps, nextState) {
		const shouldUpdate =
			nextProps.player.name !== this.props.player.name ||
			nextState.paVal !== this.state.paVal ||
			nextState.temp !== this.state.temp ||
			this.state.showOptions !== nextState.showOptions

		return shouldUpdate
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

	render () {
		const { showOptions } = this.state
		const { player, actions } = this.props
		const paVal = this.state.paVal || player.stats.PA
		const temp = this.state.temp || player.temp || 0
		const classes = classNames('cell-player-name', {'show-menu': showOptions})

		const tempMin = -5
		const tempMax = 5

		const playingRange = Math.floor(player.stats.PA * 0.125)
		const playingMin = Math.max(0, player.stats.PA - playingRange)
		const playingMax = Math.min(player.stats.PA + playingRange, 800)

		return (
			<div
				className={classes}
				onMouseEnter={this.handleMouseEnter.bind(this)}
				onMouseLeave={this.handleMouseLeave.bind(this)}>
					<div className='name'>
						{player.name}
					</div>
					<div className='menu'>
						<table className="slider-controls">
							<tbody>
							<tr className='slider'>
								<td className="label">PA: </td>
								<td className="range-limit min">{playingMin}</td>
								<td>
									<input
										value={paVal}
										type="range"
										id="playing-time"
										name="playing-time"
										min={playingMin}
										max={playingMax}
										step={1}
										onChange={(e) => this.setState({paVal: e.target.value})}
										onClick={() => this.props.handleAtBatChange(player.id, Math.floor(this.state.paVal))} />
								</td>
								<td className="range-limit max">{playingMax}</td>
								<td className="current-val">{paVal}</td>
							</tr>
							<tr className='slider'>
								<td className="label">Temp: </td>
								<td className="range-limit min">{tempMin}</td>
								<td>
									<input
										type="range"
										value={temp}
										id="temperature"
										name="temperature"
										min={tempMin}
										max={tempMax}
										step={0.5}
										onChange={(e) => this.setState({temp: e.target.value})}
										onClick={() => this.props.handleTempChange(player.id,this.state.temp)} />
								</td>
								<td className="range-limit max">{tempMax}</td>
								<td className="current-val">{temp}</td>
							</tr>
						</tbody>
						</table>
						{/* <IconButton
							toggleButton={this.handleFavoriteClick.bind(this)}
							isActive={player.isFavorited}
							type={'watch'} />
						<IconButton
							toggleButton={this.handleSleeperClick.bind(this)}
							isActive={player.isSleeper}
							type={'sleeper'} /> */}
					</div>
			</div>
		)
	}
}

CellPlayerName.propTypes = {
	player: PropTypes.object,
}

export default CellPlayerName;

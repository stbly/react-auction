import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import * as SettingsUtils from '../helpers/SettingsUtils'
import { playerIsUndrafted, primaryPositionFor } from '../helpers/PlayerListUtils'
import { flatten, flattenToObject, valueMatch } from '../helpers/arrayUtils'
import { stringMatch } from '../helpers/stringUtils'

import FilteredTable from '../components/FilteredTable.js'
import PlayerInput from '../components/PlayerInput'
import ActivePlayer from './ActivePlayer'
import ListFilters from '../components/ListFilters'
import TableRowPlayer from '../components/TableRowPlayer'

import {createFilter, filterBy} from '../helpers/filterUtils';
import { StatColumn, CostColumn, PositionColumn, ValueColumn, TableColumn } from '../helpers/tableUtils'

import '../../stylesheets/components/player-list.scss'

//MAJOR TODO: allow filters to be cumulative, not just one at a time

class PlayerListsContainer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			listType: 'batter',
			hideDraftedPlayers: false
		}
	}

	setFilter (property, value) {
		console.log('setFilter', property, value)
		this.setState({
			filter: {
				property,
				value
			}
		})
	}

	shouldComponentUpdate (nextProps, nextState) {
		var stringifiedNextProps = JSON.stringify(nextProps)
		var stringifiedProps = JSON.stringify(this.props)
		var stringifiedNextState = JSON.stringify(nextState)
		var stringifiedState = JSON.stringify(this.state)

		// console.log(this.props.players)
		var bool = (stringifiedNextProps != stringifiedProps || stringifiedNextState != stringifiedState)
		// console.log(stringifiedNextProps === stringifiedProps)
		// console.log('should i update?',bool)
		return bool //|| this.props.shouldRender
	}

	setListType (type) {
		if (this.state.type === type) return
		this.setState({
			listType: type
		})
	}

	dataWasFiltered (prop, value) {
		switch (prop) {
			case 'type':
				this.setListType(value)
				break
			case 'pos':
				const { positionData } = this.props
				const types = this.getPositionTypes()
				for (var i = 0; i < types.length; i++) {
					const type = types[i]
					const categories = positionData[type].categories
					const categoryMatch = categories[value]
					if (categoryMatch) {
						return this.setListType(type)
					}
				}
				break
		}
	}

	createPlayerArrayFromIds (idsArray) {
		const { players } = this.props
		return idsArray.map( id => players[id] )
	}

	getPositionTypes () {
		const { positionData } = this.props
		return Object.keys(positionData)
	}

	getPositionsForType (type) {
		const { positionData } = this.props
		const { positions } = positionData[type]
		return Object.keys(positions)
	}

	getPlayerIds () {
		const { players } = this.props
		return Object.keys( players )
	}

	getCategories () {
		const { listType } = this.state
		const { positionData } = this.props
		const { categories } = positionData[listType]

		return categories
	}

	getPlayers () {
		let filteredIds = this.getFilteredPlayerIds();
		return this.createPlayerArrayFromIds( filteredIds );
	}

	getSearchablePlayers () {
		const { players } = this.props
		const playerIds = this.getPlayerIds()
		const unusedPlayerIds = playerIds.filter( id => playerIsUndrafted( players[id] ) )

		return this.createPlayerArrayFromIds( unusedPlayerIds );
	}

	getFilteredPlayerIds () {
		const { players } = this.props
		const { hideDraftedPlayers } = this.state

		const filteredIds = this.getPlayerIds().filter( id => {
			const player = players[id]
			const playerHasValue = player.value
			const showIfUndrafted = hideDraftedPlayers ? !player.cost : true

			return playerHasValue && showIfUndrafted
		})

		return filteredIds
	}

	getFilters () {
		const positionTypes = this.getPositionTypes()
		const positionFilters = positionTypes.map( type => {
			const typeFilter = createFilter('type', type, type + 's')
			const positionFilters = this.getPositionsForType(type).map( position => {
				return createFilter( 'pos', position )
			})

			return [typeFilter, ...positionFilters]
		})

		return [
			createFilter('type', positionTypes, 'all players'),
			...flatten(positionFilters),
			createFilter('isFavorited', 'Favorited')
		]
	}

	setSearchQuery (value) {
		if (value.length > 0) {
			this.setState({searchQuery: value})
		} else {
			this.setState({searchQuery: null})
		}
	}

	toggleHideDraftedPlayers () {
		this.setState({hideDraftedPlayers: !this.state.hideDraftedPlayers})
	}

	render () {
		const { listType } = this.state

		return (
			<div className='player-lists-container'>
				<section className='drafting-tools'>
					<div className='player-lists-header'>
						<ActivePlayer />
						<PlayerInput
							searchablePlayers={this.getSearchablePlayers()}
							searchableTeams={this.props.teams}
							playerEntered={this.props.actions.assignPlayer} />
					</div>
					<div className='hide-selected-container'>
						<input className='hide-selected-toggle'
							ref={(ref) => this.hideSelectedToggle = ref}
							type="checkbox"
							checked={this.state.hideDraftedPlayers}
							onChange={this.toggleHideDraftedPlayers.bind(this)} />

						<span className='hide-selected-text'>Hide Drafted Players</span>
					</div>
				</section>

				<FilteredTable
					data={this.getPlayers()}
					columns={this.getColumns()}
					filters={this.getFilters()}
					searchParameter='name'
					onDataFiltered={this.dataWasFiltered.bind(this)}
					classes={classNames('player-list', listType)} >
						<TableRowPlayer data={ {} } columns={ [] } />
				</FilteredTable>
			</div>
		)
	}

	getColumns () {
		return [
			...this.renderMetaColumns(),
			...this.renderValueColumns(),
			...this.renderCategoryColumns()
		]
	}

	renderMetaColumns () {
		const cellCalculation = (input) => primaryPositionFor(input)
		return [
			TableColumn('rank', {heading: '#'}),
			// FavoritedColumn(),
			PositionColumn('pos', {heading: 'pos'}),
			TableColumn('name')
		]
	}

	renderValueColumns () {
		const { changePlayerCost } = this.props.actions

		return [
			CostColumn(changePlayerCost),
			ValueColumn('adjustedValue', {heading: 'bid'}),
			ValueColumn('value', {heading: 'val'})
		]
	}

	renderCategoryColumns () {
		const { changePlayerStat } = this.props.actions
		const categories = this.getCategories()

		return Object.keys(categories).map( id => {
			const isRatio = categories[id].isRatio

			return StatColumn(id, changePlayerStat, isRatio)
		})
	}
}

PlayerListsContainer.propTypes = {
	players: PropTypes.object.isRequired,
	positionData: PropTypes.object.isRequired,
	teams: PropTypes.array,
	isLoading: PropTypes.bool,
	actions: PropTypes.object
}

export default PlayerListsContainer

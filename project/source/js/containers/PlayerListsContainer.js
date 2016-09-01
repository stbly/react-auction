import React, { Component, PropTypes } from 'react'
import { Router, RouteHandler, Link, browserHistory } from 'react-router'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import classNames from 'classnames';

import * as SettingsUtils from '../helpers/SettingsUtils'
import { playerIsUndrafted, primaryPositionFor } from '../helpers/PlayerListUtils'
import { flatten, valueMatch } from '../helpers/arrayUtils'
import { stringMatch } from '../helpers/stringUtils'

import Table from '../components/Table.js'
import PlayerInput from '../components/PlayerInput'
import ActivePlayer from './ActivePlayer'
import ListFilters from '../components/ListFilters'

import {createFilter, filterBy} from '../helpers/filterUtils';
import { StatColumn, CostColumn, PositionColumn, ValueColumn, TableColumn } from '../helpers/tableUtils'

import '../../stylesheets/components/player-list.scss'

//MAJOR TODO: allow filters to be cumulative, not just one at a time

class PlayerListsContainer extends Component {
	constructor(props) {
		super(props)
		this.state = {
			filter: {
				property: 'type',
				value: 'batter'
			},
			hideDraftedPlayers: false,
			searchQuery: null
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
		const types = this.getFilteredPlayerTypes();
		const categoryArray = types.map( type => this.props.positionData[type].categories )
		return flatten(categoryArray)
	}

	getCategoryIds () {
		const categories = this.getCategories()
		return Object.keys(categories)
	}

	getCategoryArray () {
		const categories = this.getCategories()
		return this.getCategoryIds().map( id => Object.assign({}, categories[id], {id}) )
	}

	getPlayers () {
		const { searchQuery } = this.state
		const { players } = this.props
		let filteredIds = this.getFilteredPlayerIds();

		if (searchQuery && searchQuery.length > 2) {
			filteredIds = filteredIds.filter( id => {
				const name = players[id].name
				return stringMatch(name, searchQuery)
			})
		}

		return this.createPlayerArrayFromIds( filteredIds );
	}

	getFilteredPlayerTypes () {
		const positionTypes = this.getPositionTypes()
		const filterValue = this.state.filter.value

		return positionTypes.filter( type => {
			let match = valueMatch(type, filterValue)
			if (!match) {
				const positions = this.getPositionsForType(type)
				match = valueMatch(positions, filterValue)
			}
			return match
		})
	}

	getSearchablePlayers () {
		const { players } = this.props
		const playerIds = this.getPlayerIds()
		const unusedPlayerIds = playerIds.filter( id => playerIsUndrafted( players[id] ) )

		return this.createPlayerArrayFromIds( unusedPlayerIds );
	}

	getFilteredPlayerIds () {
		const { players } = this.props
		const { property, value } = this.state.filter
		const filteredIds = this.getPlayerIds().filter( id => {
			const player = players[id]
			const playerHasValue = player.value
			const propertyToCompare = (property === 'pos') ? primaryPositionFor(player) : player[property]
			const propertyMatch = valueMatch(propertyToCompare, value)

			return propertyMatch && playerHasValue
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

	getSortingRules () {
		const sortByParamThenValue = (param) => [
			{ param: param },
			{ param: 'adjustedValue', direction: -1 }
		]

		return {
			name: sortByParamThenValue,
			cost: sortByParamThenValue,
			pos: sortByParamThenValue,

		}
	}

	toggleHideDraftedPlayers () {
		this.setState({hideDraftedPlayers: !this.state.hideDraftedPlayers})
	}

	render () {
		const mainClass = classNames({'is-loading': this.props.isLoading});

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
				<section className='section-with-sidebar'>
					<div className='sidebar'>
						<ListFilters
							activeFilter={this.state.filter.value}
							searchQuery={this.state.searchQuery}
							setSearchQuery={this.setSearchQuery.bind(this)}
							filterSelected={this.setFilter.bind(this)}
							filters={this.getFilters()} />
					</div>

					<div className='main'>
						<div className={mainClass}>
							<Table
								data={this.getPlayers()}
								columns={this.getColumns()}
								sortingRules={this.getSortingRules()} />
						</div>
					</div>
				</section>
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

		return this.getCategoryIds().map( id => {
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

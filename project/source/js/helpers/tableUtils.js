import React from 'react'
import classNames from 'classnames';
import {Tr, Td, Thead, Th} from 'reactable-cacheable'

import InputPlayerStat from '../components/InputPlayerStat.js'
import CellPlayerCost from '../components/CellPlayerCost.js'
import IconButton from '../components/IconButton'

import { primaryPositionFor } from './PlayerListUtils'

export const renderHeaderCells = (columns) => {
	return columns.map( (object, index) => {
		const {column, className} = object
		const classes = classNames(className || column)
		return (
			<Th key={index} className={classes} column={column}>
				{column}
			</Th>
		)
	})
}

export const createHeaderRow = (columns) => {
	const cells = renderHeaderCells(columns)
	return (
		<Thead>
			{ cells }
		</Thead>
	)
}

export const createRows = (data, columns, classFunctions) => {
	return data.map( (item, index) => {
		const classes = classFunctions ? classFunctions(item) : null
		return (
			<Tr className={classes} key={index}>
				{ createCells(item, columns) }
			</Tr>
		)
	})
}

export const createCells = (item, columns) => {
	return columns.map( (object, index) => {
		const {column, className, content} = object
		const { value, element, colSpan, cellClass } = content(item)
		const data = (element || value)

		const classes = classNames(className, cellClass)

		return (
			<Td colSpan={colSpan} key={index} className={classes} column={column} value={value}>
				{ data }
			</Td>
		)
	})
}

export const createStatCells = (categoryObject, changeHandler) => {
	return Object.keys(categoryObject).map( statId => {
		const { isRatio } = categoryObject[statId]
		return statCellFactory(statId, changeHandler, isRatio)
	})
}

export const statCellFactory = (statId, handler, isRatio=false) => {

	return {
		column: statId,
		className: 'can-edit',
		content: (player, index) => {

			const statValue = player.stats[statId] || 0
			const statChangeHandler = (value) => {
				return handler(player.id, statId, value)
			}

			return {
				value: statValue,
				element: <InputPlayerStat
		        	category={statId}
		        	key={index}
		        	value={statValue || 0}
		        	isRatio={isRatio}
		        	onStatChange={statChangeHandler} />
	        }
		}
	}
}

export const costCellFactory = (handler) => {

	return {
		column: 'cost',
		className: 'can-edit',
		content: (player, index) => {

			const cost = Number(player.cost || 0)
			const hasCost = cost > 0
			const costChangeHandler = (value) => {
				return handler(player.id, value)
			}

			return {
				value: player.id,
				colSpan: hasCost ? 3 : 1,
				element: (
					<CellPlayerCost
						cost = {cost}
			        	onCostChange = {costChangeHandler} />
	        	)
	        }
		}
	}
}

export const valueCellFactory = (property, heading=null) => {
	return {
		column: heading || property,
		content: (player) => {
			const value = Number(player[property]).toFixed(1)
			const hasCost = player.cost > 0
			const cellClass = classNames({'hidden': hasCost})
			return {
				value: value,
				cellClass,
				element: <span className='dollar-amount'> {value} </span>
			}
		}
	}
}

export const positionCellValueFactory = () => {
	return  {
		column: 'pos',
		content: (player) => {
			return {
				value: player.id,
				element: primaryPositionFor(player)
			}
		}
	}
}

export const positionCellFactory = () => {
	return {
		column: 'position',
		className: 'hidden',
		content: (player) => {
			return {
				value: primaryPositionFor(player)
			}
		}
	}
}

export const favoriteCellFactory = (handler) => {
	return {
		column: '*',
		className: 'favorite-toggle',
		content: (player) => {
			const toggleHandler = () => handler(player.id)
			return {
				value: player.isFavorited,
				element: (
					<IconButton
						toggleButton={toggleHandler}
						isActive={player.isFavorited}
						type={'watch'} />
				)
			}
		}
	}
}

export const nameCellFactory = (handler) => {
	return {
		column: 'name',
		className: 'has-action widen',
		content: (player) => {
			const value = player.name
			const clickHandler = () => handler(player.id)

			return {
				value,
				element: <span onClick={clickHandler}> {value} </span>
			}
		}
	}
}

export const cellFactory = (property, params={}) => {
	const {className, heading, onClick} = params

	return {
		className,
		column: heading || property,
		content: (player) => {

			const value = player[property] || 0
			const element = onClick ? <span onClick={onClick}> {value}> </span> : null

			return {
				value,
				element
			}
		}
	}
}

export const createNameMatchFilter = (column, button=null) => {
	const filterFunction = (contents, filter) => contents.toLowerCase().indexOf(filter) > -1
	return {
		column,
		button,
		filterFunction
	}
}

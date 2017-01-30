import React from 'react'
import classNames from 'classnames';
import {Tr, Td, Thead, Th} from 'reactable-cacheable'

import InputPlayerStat from '../components/InputPlayerStat.js'
import CellPlayerCost from '../components/CellPlayerCost.js'
import IconButton from '../components/IconButton'

import { sort } from './arrayUtils'

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

export const createRows = (data, columns, classFunctions, actions={}) => {
	return data.map( (item, index) => {
		const classes = classFunctions ? classFunctions(item) : null
		const { onClick } = actions
		return (
			<Tr className={classes} key={index} onClick={ onClick ? (onClick).bind(this, item) : null}>
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
	const categoriesWithSgpd = Object.keys(categoryObject).filter( key => categoryObject[key].sgpd )
	return categoriesWithSgpd.map( statId => {
		const { isRatio } = categoryObject[statId]
		return statCellFactory(statId, changeHandler, isRatio)
	})
}

export const cellFactory = (property, params={}) => {
	const {className, heading, onClick, valueFunction } = params

	return {
		className,
		column: heading || property,
		content: (object) => {

			const value = valueFunction ? valueFunction(object) : (object[property] || 0)
			const element = onClick ? <span onClick={onClick}> {value}> </span> : null

			return {
				value,
				element
			}
		}
	}
}

export const statCellFactory = (statId, handler, isRatio=false) => {

	return {
		column: statId,
		className: handler ? 'can-edit' : null,
		content: (player, index) => {

			const statValue = player.stats[statId] || 0
			const statChangeHandler = (value) => {
				return handler ? handler(player.id, statId, value) : null
			}

			const isNull = player.stats[statId] === null || player.stats[statId] === undefined
			const cellClass = classNames({'no-value':isNull})
			return {
				value: statValue,
				cellClass,
				element: <InputPlayerStat
		        	category={statId}
		        	key={index}
		        	value={statValue || 0}
		        	isRatio={isRatio}
		        	disabled={!handler}
		        	onStatChange={statChangeHandler} />
	        }
		}
	}
}

export const costCellFactory = (handler) => {

	return {
		column: 'cost',
		className: handler ? 'can-edit' : null,
		content: (player, index) => {

			const cost = Number(player.cost || 0)
			const hasCost = cost > 0
			const costChangeHandler = (value) => {
				return handler ? handler(player.id, value) : null
			}

			return {
				value: player.id,
				colSpan: hasCost && handler ? 3 : 1,
				element: (
					<CellPlayerCost
						cost = {cost}
			        	disabled={!handler}
			        	onCostChange = {costChangeHandler} />
	        	)
	        }
		}
	}
}

export const valueCellFactory = (property, heading=null, forceDisplay) => {
	return {
		column: heading || property,
		content: (player) => {
			const isNull = player[property] === null || player[property] === undefined
			const value = Number(player[property]).toFixed(1)
			const hasCost = !forceDisplay && player.cost > 0
			const cellClass = classNames({'hidden': hasCost, 'no-value': isNull})

			return {
				value: value,
				cellClass,
				element: <span className={classNames('dollar-amount')}> {value} </span>
			}
		}
	}
}

export const earnedCellFactory = () => {
	return {
		column: 'earned',
		content: (player) => {
			const isNull = player.cost === null || player.cost === undefined
			const earned = Number( player.value - player.cost ).toFixed(1)
			const cellClass = classNames({ 'no-value': isNull})

			return {
				value: earned,
				cellClass,
				element: <span className={classNames('dollar-amount')}> {earned} </span>
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
		// className: 'hidden',
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
			const clickHandler = () => {
				if (handler) {
					handler(player.id)
				}
			}

			return {
				value,
				element: <span onClick={clickHandler}> {value} </span>
			}
		}
	}
}

export const createNameMatchFilter = (column, params) => {
	const { label, substring } = params
	const filterFunction = (contents, filter) => {
		const string = contents.toLowerCase()
		return substring ? string.indexOf(filter) > -1 : string === filter
	}
	return {
		column,
		label,
		filterFunction
	}
}


// Sorting Functions //

export const sortPosition = (players) => {
	return {
		column: 'pos',
		direction: 'desc',
		sortFunction: (playerIdA, playerIdB) => {
			const posA = primaryPositionFor( players[playerIdA] )
			const posB = primaryPositionFor( players[playerIdB] )
			const valueA = players[playerIdA].adjustedValue
			const valueB = players[playerIdB].adjustedValue
			const descending = direction === 1 ? false : true
			const comparePosition = sort(posA, posB, false, false)
			const compareValue = sort(valueA, valueB, descending)

			return sortMultiple( comparePosition, compareValue )
		}
	}
}

export const sortCost = (players) => {
	return {
		column: 'cost',
		direction: 'desc',
		sortFunction: (a,b) => {
			const playerA = players[a]
			const playerB = players[b]
			const costSort = sort(playerA.cost, playerB.cost, false, false)
			const valueSort = sort(playerA.value, playerB.value, direction)

			return sortMultiple( costSort, valueSort)
		}
	}
}

export const sortNumber = (column, desc=false) => {
	return {
		column,
		direction: desc? 'desc' : 'asc',
		sortFunction: (a, b) => {
			return sort(Number(a), Number(b), true, false)
		}
	}
}
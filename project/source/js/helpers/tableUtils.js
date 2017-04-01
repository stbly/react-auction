import React from 'react'
import classNames from 'classnames';
import {Tr, Td, Thead, Th} from 'reactable-cacheable'

import InputPlayerStat from '../components/InputPlayerStat.js'
import CellPlayerCost from '../components/CellPlayerCost.js'
import IconButton from '../components/IconButton'
import InputToggle from '../components/InputToggle'

import { sort, sortMultiple } from './arrayUtils'

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
	
	const returnData = data.map( (item, index) => {
		const classes = classFunctions ? classFunctions(item) : null
		const { onClick } = actions
		return (
			<Tr className={classes} key={index} onClick={ onClick ? (onClick).bind(this, item) : null}>
				{ createCells(item, columns) }
			</Tr>
		)
	})

	return returnData
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
		const { isRatioStat, max, min } = categoryObject[statId]
		return statCellFactory(statId, changeHandler, {isRatioStat, max, min})
	})
}

export const cellFactory = (property, params={}) => {
	const {className, heading, onClick, valueFunction, elementFunction, isText } = params

	const hasActionClass = onClick ? 'has-action' : ''
	const classes = className ? [className, hasActionClass].join(' ') : hasActionClass

	return {
		className: classes,
		column: heading || property,
		content: (object) => {

			const handleClick = onClick ? () => { onClick(object) } : null
			const value = valueFunction ? valueFunction(object) : (object[property] || (isText ? '' : 0))
			const element = elementFunction ? elementFunction(object) : 
				onClick ? <span onClick={ handleClick }> {value} </span> : null

			return {
				value,
				element
			}
		}
	}
}

export const statCellFactory = (statId, handler, params) => {
	const {isRatioStat, max, min} = params || {}
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
		        	isRatioStat={isRatioStat}
		        	max={max}
		        	min={min}
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

export const tierCellFactory = (tierPosition, handler) => {

	return {
		column: 'tier',
		className: handler ? 'small-cell can-edit' : null,
		content: (player) => {

			const tierChangeHandler = (value) => {
				return handler ? handler(player.id, tierPosition, value) : null
			}

			return {
				value: player.tier,
				colSpan: 1,
				element: (
					<InputToggle
						value={player.tiers[tierPosition]}
						max={100}
						min={0}
						valueDidChange={tierChangeHandler} />
	        	)
	        }
		}
	}
}

export const isDraftedCellFactory = (handler) => {

	return {
		column: 'drafted',
		className: classNames('small-cell', {'can-edit': handler }),
		content: (player, index) => {

			const isDraftedHandler = (e) => {
				const { checked } = e.target
				return handler ? handler(player.id, checked) : null
			}

			return {
				element: (
					<input className='setting-toggle'
						type="checkbox" 
						checked={player.isDrafted || false}
						onChange={ isDraftedHandler } />
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
			const cellClass = classNames('small-cell', {'hidden': hasCost, 'no-value': isNull})

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

export const favoriteCellFactory = (handler) => {
	return {
		column: '*',
		className: 'small-cell favorite-toggle',
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

export const createNameMatchFilter = (column, matches, params={}) => {
	const { heading, substring } = params
	const filterFunction = (contents, filter) => {
		// console.log('createNameMatchFilter', contents, filter)
		const string = contents.toLowerCase()
		return substring ? string.indexOf(filter) > -1 : string === filter
	}
	return {
		column,
		heading,
		label: matches,
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
			// const descending = direction === 1 ? false : true
			const comparePosition = sort(posA, posB, false, false)
			const compareValue = sort(valueA, valueB, true) //descending)

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
			const valueSort = sort(playerA.value, playerB.value, false)//, direction)

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
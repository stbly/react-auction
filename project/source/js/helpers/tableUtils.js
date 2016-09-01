import React from 'react'
import InputPlayerStat from '../components/InputPlayerStat.js'
import InputPlayerCost from '../components/InputPlayerCost.js'
import { primaryPositionFor } from './PlayerListUtils'

export const TableColumn = (category, params={}) => {
	const {
		heading,
		classes,
		cellContent,
		cellContentParams,
		sortParam } = params

	return {category, heading, cellContent, cellContentParams, sortParam, classes}
}

export const StatColumn = (category, statChangeDispatcher, isRatio=false, params={}) => {
	const cellContent = (id, stats) => {
		const statValue = stats[category]
		const onStatChange = (stat, newValue) => statChangeDispatcher(id, stat, newValue)

		return <InputPlayerStat value={statValue} category={category} onStatChange={onStatChange} isRatio={isRatio} />
	}

	const sortParam = (param) => {
		return {param: param, paramFunction: (player) => player.stats[category] }
	}

	return TableColumn(category,
		Object.assign({}, params, {
			cellContent,
			cellContentParams: ['id','stats'],
			sortParam
		})
	)
}

export const CostColumn = (costChangeDispatcher, params={}) => {
	const cellContent = (id, cost) => {
		const onCostChange = (newCost) => costChangeDispatcher(id, newCost)

		return <InputPlayerCost cost={cost} onCostChange={onCostChange} />
	}

	const sortParam = (param) => [
		{ param: param, paramFunction: (data) => data.cost || 0, direction: -1},
		{ param: 'adjustedValue' }
	]

	return TableColumn('cost', Object.assign({}, params, { cellContent, cellContentParams: ['id', 'cost'], sortParam }) )
}

export const ValueColumn = (category, params={}) => {
	const cellContent = (data) => {
		return Number(data[category]).toFixed(1)
	}

	return TableColumn(category, Object.assign({}, params, { cellContent }) )
}

export const PositionColumn = (params={}) => {
	const cellContent = (data) => {
		return primaryPositionFor(data)
	}

	const sortParam = (param) => [
		{ param: param, paramFunction: cellContent },
		{ param: 'adjustedValue', direction: -1 }
	]

	return TableColumn('pos', Object.assign({}, params, { cellContent, sortParam }) )
}
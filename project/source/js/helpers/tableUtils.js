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
		sortFunction } = params

	return {category, heading, cellContent, cellContentParams, classes}
}

export const StatColumn = (category, statChangeDispatcher, isRatio=false, params={}) => {
	const cellContent = (id, stats) => {
		const statValue = stats[category]
		const onStatChange = (stat, newValue) => statChangeDispatcher(id, stat, newValue)

		return <InputPlayerStat value={statValue} category={category} onStatChange={onStatChange} isRatio={isRatio} />
	}

	const sortFunction = () => {

	}


	return TableColumn(category,
		Object.assign({}, params, {
			sortFunction,
			cellContent,
			cellContentParams: ['id','stats']
		})
	)
}

export const CostColumn = (costChangeDispatcher, params={}) => {
	const cellContent = (id, cost) => {
		const onCostChange = (newCost) => costChangeDispatcher(id, newCost)

		return <InputPlayerCost cost={cost} onCostChange={onCostChange} />
	}

	return TableColumn('cost', Object.assign({}, params, { cellContent, cellContentParams: ['id', 'cost'] }) )
}

export const ValueColumn = (category, params={}) => {
	const cellContent = (data) => {
		return Number(data[category]).toFixed(1)
	}

	return TableColumn(category, Object.assign({}, params, { cellContent }) )
}

export const PositionColumn = (category, params={}) => {
	const cellContent = (data) => {
		return primaryPositionFor(data)
	}

	return TableColumn(category, Object.assign({}, params, { cellContent }) )
}
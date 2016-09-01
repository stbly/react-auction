import React from 'react'
import classNames from 'classnames';
import { updatePlayerFavorited } from '../redux/modules/players'
import IconButton from './IconButton'
import TableColumn from './TableColumn'

const FavoritedColumn = (params={}) => {
	const cellCalculation = (player) => player.isFavorited

	const cellContent = (player) => {

		const {id, isFavorited} = player
		const togglePlayerFavorited = (player) => {
			const {id} = player
			return updatePlayerFavorited(id)
		}

		return (
			<IconButton
				toggleButton={togglePlayerFavorited}
				active={isFavorited}
				type={'watch'} />
		)
	}

	const newParams = Object.assign({}, params, {
		heading: '*',
		cellContent
	})

	return TableColumn('isFavorited', newParams)
}

export default FavoritedColumn
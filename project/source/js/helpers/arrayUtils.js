export const combineValues = (a, b) => a + b


export const arrayCheck = array => {
	return (Object.prototype.toString.call( array ) === '[object Array]')
}

export const flatten = array => {
	return array.reduce( (output, next) => output.concat(next) )
}

const isMatch = (item, query, strictMatch=true) => strictMatch ? item === query : item.indexOf(query) > -1

const itemHas = (item, query, strictMatch=true) => {
	const itemIsArray = arrayCheck(item)

	if (itemIsArray) {
		for (var i=0; i<item.length; i++) {
			const match = isMatch( item[i], query, strictMatch )
			if (match) {
				return true
			}
		}
	}

	return isMatch (item, query, strictMatch)
}

export const valueMatch = (item, value, strictMatch=true) => {
	const valueIsArray = arrayCheck(value)

	if (valueIsArray) {
		for (var i=0; i<value.length; i++) {
			const match = itemHas( item, value[i], strictMatch )
			if (match) {
				return true
			}
		}
	}

	return itemHas( item, value, strictMatch )
}

export const findLastItemWithCondition = (array, conditionFunction) => {
	for (let index = (array.length - 1); index >= 0; index--) {
		const itemAtIndex = array[index]
		if ( conditionFunction(itemAtIndex) ) {
			return itemAtIndex
		}
	}
}

export const sortBy = (array, param, reverse, byBoolean) => {

	const direction = reverse ? -1 : 1
	const paramIsArray = arrayCheck(param)

	let sortFunction
	if (paramIsArray) {
		sortFunction = array.sort( (a,b) => {

			let sortValue = 0
			let paramDirection = direction
			for (let paramIndex = 0; paramIndex < param.length; paramIndex++) {

				const currentParam = param[paramIndex].param

				if (param[paramIndex].direction) {
					paramDirection = param[paramIndex].direction
				}

				if (a[currentParam] < b[currentParam]) {
					return -1 * paramDirection
				}else if (a[currentParam] > b[currentParam]) {
					return paramDirection
				}

			}

		})
	}
	else {
		if (byBoolean) {

			sortFunction = array.sort( (a,b) => {
				const sortValue = (a[param] === b[param]) ? 0 : a[param] ? -1 : 1
				return sortValue * direction
			})

		} else {

			sortFunction = array.sort( (a,b) => {
				if (a[param] < b[param]) {
					return -1 * direction
				} else if (a[param] > b[param]) {
					return direction
				} else {
					return 0
				}
			})

		}
	}

	return sortFunction
}
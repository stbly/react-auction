export const combineValues = (a, b) => a + b

export const findLastItemWithCondition = (array, conditionFunction) => {
	for (let index = (array.length - 1); index >= 0; index--) {
		const itemAtIndex = array[index]
		if ( conditionFunction(itemAtIndex) ) {
			return itemAtIndex
		}
	}
}

export const sortBy = (array, param, reverse, byBoolean) => {

	const paramIsArray = (Object.prototype.toString.call( param ) === '[object Array]')
	const direction = reverse ? -1 : 1

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
export const combineValues = (a, b) => a + b

export const arrayCheck = array => {
	return (Object.prototype.toString.call( array ) === '[object Array]')
}

export const flatten = array => {
	return array.reduce( (output, next) => output.concat(next) )
}

export const flattenToObject = array => {
	return array.reduce( (result, currentObject) => {
	    for(var key in currentObject) {
	    	if (currentObject.hasOwnProperty(key)) {
	            result[key] = currentObject[key];
	        }
	    }
	    return result;
	}, {});
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

export const sort = (a, b, desc=false, allowZero=true) => {
	const direction = desc ? -1 : 1
	if (a < b) {
		return -1 * direction
	}else if (a > b) {
		return direction
	}else if (allowZero) {
		return 0
	}
}

export const createSort = (a, b, desc=false, allowZero) => {
	return () => sort(a, b, desc, allowZero)
}

export const sortByProperty = (a, b, property, desc=false, allowZero=false) => {
	const direction = desc ? -1 : 1
	const compareA = a[property]
	const compareB = b[property]
	return sort(compareA, compareB, desc, allowZero)
}

export const sortMultiple = (...props) => {
	for(var i = 0; i < props.length; i++) {
		const currentProps = props[i]
		if (currentProps) return currentProps
	}
}

export const sortArray = (array, desc=false, allowZero=false) => {
	const sortFunction = sort(desc, allowZero)
	return array.sort( (a, b) => sort(a, b, desc, allowZero) )
}

export const sortArrayByCategory = (array, category, desc=false, allowZero=false) => {
	return array.sort( (a,b) => {
		return sortByProperty(a, b, category, desc, allowZero)
	})
}

/*export const sort = (a, b, sortParam, paramDirection, allowZero=true) => {
	const { param, paramFunction, direction } = sortParam
	const currentParam = param || sortParam // in case sortParam isn't an object or doesn't contain param

	const currentDirection = direction || paramDirection

	const compareA = paramFunction ? paramFunction(a) : a[currentParam]
	const compareB = paramFunction ? paramFunction(b) : b[currentParam]

	if (compareA < compareB) {
		return -1 * currentDirection
	}else if (compareA > compareB) {
		return currentDirection
	}else if (allowZero) {
		return 0
	}
}*/

export const sortBy = (sortParam, reverse=false/*, byBoolean=false*/) => {

	const paramDirection = reverse ? -1 : 1
	const params = arrayCheck(sortParam) ? sortParam : [sortParam]

	return array.sort( (a,b) => {
		for (let paramIndex = 0; paramIndex < params.length; paramIndex++) {
			const currentParam = params[paramIndex]
			const sortValue = sort(a, b, currentParam, paramDirection, false)
			if (sortValue) return sortValue
		}
	})

	/*f (byBoolean) {

		sortFunction = array.sort( (a,b) => {
			const compareA = paramFunction ? paramFunction(a) : a[currentParam]
			const compareB = paramFunction ? paramFunction(b) : b[currentParam]

			const sortValue = (compareA === compareB) ? 0 : compareA ? -1 : 1
			return sortValue * currentDirection
		})

	}*/
}

export const distributeValues = (amount, weights=[]) => {
	const distributedAmounts = []
	let totalWeights = weights.reduce( (a,b) => a + b)
	
	weights.forEach( weight => {
		const weightValue = parseFloat(weight)
		const percentage = weightValue / totalWeights
		const distributedAmount = Math.round(percentage * amount)
		distributedAmounts.push(distributedAmount)
		totalWeights -= weightValue
		amount -= distributedAmount
	})

	return distributedAmounts
}

// export const getDistributions = (amount, min, max, setLength) => {

// 	if((max + max - setLength + 1) * setLength / 2 < amount) return null;
//     if((min + min + setLength - 1) * setLength / 2 > amount) return null;
//     const set = [];

//     let val = min
//     for (let i = 0; i < setLength; i++) {
//         set[i] = val++;
//     }

//     let sum = (min + val - 1) * setLength / 2;
//     let dev = amount - sum;
//     if (dev) {
//         let adj = dev / setLength;
//         if(dev % setLength) adj++;
//         for(let i = setLength -1; dev; i--)
//         {
// 	        console.log(i, adj)
//             if(adj > dev) adj = dev;
//             set[i] += adj;
//             dev -= adj;
//         }
//     }

//     console.log(amount)
//     console.log(set.reduce((a,b)))
//     return set;
// }

export const redistributeValuesToEqual = (values=[], amount, indecesToIgnore=[]) => {

	let iterator = 0
	let newValues = values.slice()

	let totalAssignedValue = newValues.reduce((a,b) => a+b);

	const lastIndex = (newValues.length - 1);
	const getIndex = (iterator) => {
		return iterator > lastIndex ? iterator % lastIndex : iterator
	}

	const surplus = totalAssignedValue - amount;
	if (surplus > 0) {
		const usableValues = values.filter( (value, index) => {
			// console.log(indecesToIgnore, index, indecesToIgnore.indexOf(index))
			return indecesToIgnore.indexOf(index) === -1
		})
		let minValue = 0
		for (var i = 0; i < usableValues.length; i++) {
			minValue++
		}
			// console.log(surplus, minValue)

		// console.log(totalAssignedValue, minValue,amount)
		// console.log( (totalAssignedValue - minValue) > amount )

		if ((totalAssignedValue - minValue) > (amount - surplus)) {
			// throw new Error('Cannot redistribute values: minimum values would be less than 0');
		}
	}

	while (totalAssignedValue > amount) {
		iterator = getIndex(iterator)
		if (indecesToIgnore.indexOf(iterator) < 0 && newValues[iterator] > 1) {
			newValues[iterator]--
		}
		iterator ++
		totalAssignedValue = newValues.reduce((a,b) => a+b);
	}
	while (totalAssignedValue < amount) {
		iterator = getIndex(iterator)
		if (indecesToIgnore.indexOf(iterator) < 0) {
			newValues[iterator]++
		}
		iterator ++
		totalAssignedValue = newValues.reduce((a,b) => a+b);
	}

	// console.log('oldValues:',values);
	// console.log('newValues:',newValues)

	return newValues
}

export const getDistributions = (amount, distributions, modifier, indecesToIgnore=[], forcedValues=[]) => {
	const values = []
	let amountLeft = amount;
	
	const forcedValueIndexes = forcedValues.map( item => item.index )
	for (let i = 0; i < distributions; i++ ) {
		var forcedValueIndex = forcedValueIndexes.indexOf(i)
		var forceValue = forcedValueIndex > -1 ? forcedValues[forcedValueIndex].value : null
		if (forceValue) {
			indecesToIgnore.push(i)
		}

		// TO DO: Find a better way to distribute values than this arbitrary modifier value
		const value = forceValue ? forceValue : Math.max(Math.round((amountLeft / (modifier || 4))),1)
		amountLeft -= value

		if (i === distributions.length - 1) {
			values.push(1)		
		} else {
			values.push(value)
		}
	}


	// -------------------------------------------- //
	// --- correct for cases where total values --- //
	// --- end up greater/less than amount      --- //
	// -------------------------------------------- //

	const correctedValues = redistributeValuesToEqual(values, amount, indecesToIgnore, forcedValues)	

	// -------------------------------------------- //
	// -------------- end correction -------------- //
	// -------------------------------------------- //

	return correctedValues;
}

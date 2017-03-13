import { arrayCheck } from './arrayUtils'

/**
 * Code via Salakar on Stack Overflow http://stackoverflow.com/a/34749873
 */

export const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (...params) => { 
	const returnVal = params.reduce( (source, target) => {
		if (arrayCheck(source)) source = Array.toObject(source)
		if (arrayCheck(target)) target = Array.toObject(target)

		if (isObject(source) && isObject(source)) {
			for (const key in target) {
				if (isObject(target[key])) {
					if (!source[key]) Object.assign(source, { [key]: {} });
					mergeDeep(source[key], target[key]);
				} else {
					Object.assign(source, { [key]: target[key] });
				}
			}
		}
		return source;
	})
	
	return returnVal
}

export const cleanObject = (target, source) => {
	let newObject = {}

	const targetIsObject = isObject(target)
	const sourceIsObject = isObject(source)

	if (targetIsObject && sourceIsObject) {
		for (const key in target) {

			const existingData = source[key]
			const newData = target[key]

			if (isObject(newData)) {
				if (!existingData) Object.assign(newObject, { [key]: newData })
				Object.assign(newObject, {
					[key]: cleanObject(newData, existingData)
				})
			} else {
				if (!existingData || newData !== existingData) {
					Object.assign(newObject, { [key]: newData });
				}
			}
		}
	} else {
		newObject = Object.assign(newObject, target)
	}

	return newObject
}

export function endpointToObject(endpoint, value) {
	const dataPoints = endpoint.split('/')
	let newObject = {}
	let lastPoint = newObject

	for (var i=0; i < dataPoints.length; i++) {
		const point = dataPoints[i]
		if (i === dataPoints.length - 1) {
			lastPoint[point] = value
		} else {
			lastPoint[point] = {}
			lastPoint = lastPoint[point]
		}
	}

	return newObject
}
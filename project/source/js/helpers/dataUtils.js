/**
 * Code via Salakar on Stack Overflow http://stackoverflow.com/a/34749873
 */

const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export const mergeDeep = (target, source) => { 
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return target;
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
/**
 * Code via Salakar on Stack Overflow http://stackoverflow.com/a/34749873
 */

function isObject(item) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, source) {
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
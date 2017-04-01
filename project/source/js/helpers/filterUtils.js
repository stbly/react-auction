
Object.filter = (obj, predicate) =>
    Object.keys(obj)
          .filter(key => predicate(obj[key]))
          .reduce((res, key) => (res[key] = obj[key], res), {});

//TO DO: consider setting this on Object prototype
Object.toArray = (obj, id='id') =>
	Object.keys(obj)
		.map(key => {
			const item = obj[key]
			return Object.assign({}, item, {
				[id]: key
			})
		})
//TO DO: consider setting this on Array prototype
Array.toObject = (array, id='id') => {
	var object = {};
	for (var i = 0; i < array.length; i++) {
		var item = array[i]
		if (array[i] !== undefined) {
			var key = item[id];
			if (!key) {
				object[i] = item;
			} else {
				object[key] = item;
			}
		}
	}
	return object;
}

const createFilter = (property, value, text) => {
	return { property, value, text }
}

const filterBy = (array, prop, value) => {
	value = value === null ? true : value
	return array.filter( obj => {
		return obj[prop] === value
	});
}

const propIsArray = (prop) => {
	return Object.prototype.toString.call( prop ) === '[object Array]'
}
const propIsObject = (prop) => {
	return Object.prototype.toString.call( prop ) === '[object Object]'
}

export { createFilter, filterBy }
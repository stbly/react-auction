import {primaryPositionFor} from './PlayerListUtils';

Object.filter = (obj, predicate) =>
    Object.keys(obj)
          .filter(key => predicate(obj[key]))
          .reduce((res, key) => (res[key] = obj[key], res), {});

Object.toArray = (obj, id='id') =>
	Object.keys(obj)
		.map(key => {
			var item = obj[key]
			item[id] = key
			// console.log(key, item[id])
			return item
		})

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

const filterBy = (array, prop, value) => {
	value = value === null ? true : value
	return array.filter( obj => {
		return obj[prop] === value
	});
}

const filterByPosition = (array, pos) => {
	return array.filter(function (obj) {
		return primaryPositionFor(obj) === pos
	});
}

const propIsArray = (prop) => {
	return Object.prototype.toString.call( prop ) === '[object Array]'
}
const propIsObject = (prop) => {
	return Object.prototype.toString.call( prop ) === '[object Object]'
}

export { filterBy, filterByPosition }
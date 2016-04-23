const filterBy = (array, prop, value) => {
	value = value === null ? true : value
	return array.filter( obj => {
		return obj[prop] === value
	});
}

const filterByPosition = (array, pos) => {
	return array.filter(function (obj) {
		return obj.pos === pos
	});
}

export { filterBy, filterByPosition }
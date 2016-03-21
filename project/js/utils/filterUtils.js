const filterByPosition = (array, pos) => {
	return array.filter(function (obj) {
		return obj.pos === pos;
	});
}

export { filterByPosition }
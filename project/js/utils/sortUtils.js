const sortBy = (array, param, reverse) => {

	var paramIsArray = (Object.prototype.toString.call( param ) === '[object Array]');
	var sortFunction;
	var direction = reverse ? -1 : 1;

	if (paramIsArray)
		sortFunction = array.sort( (a,b) => {

			var sortValue = 0;
			var paramIndex = 0;
			for (paramIndex; paramIndex < param.length; paramIndex++) {
				var currentParam = param[paramIndex];
				if (a[currentParam] < b[currentParam]) {
					sortValue = -1;
					break;
				}
				else if (a[currentParam] > b[currentParam]) {
					sortValue = 1;
					break;
				}
			}

			/*if (paramIndex===0 && reverse) {
				sortValue = (sortValue * direction);
			}*/

			return (sortValue * direction);
		})
	else {
		sortFunction = array.sort( (a,b) => {
			var sortValue = 0

			if (a[param] < b[param]) {
				sortValue = -1;
			} else if (a[param] > b[param]) {
				sortValue = 1;
			}

			return (sortValue * direction);
		})
	}

	return sortFunction;
}

export { sortBy }
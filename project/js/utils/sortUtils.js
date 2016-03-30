const sortBy = (array, param, reverse, byBoolean) => {

	var paramIsArray = (Object.prototype.toString.call( param ) === '[object Array]');
	var sortFunction;
	var direction = reverse ? -1 : 1;

	if (paramIsArray)
		sortFunction = array.sort( (a,b) => {

			var sortValue = 0;
			var paramIndex = 0;
			var paramDirection = direction;
			for (paramIndex; paramIndex < param.length; paramIndex++) {
				var currentParam = param[paramIndex].param;
				if (param[paramIndex].direction) {
					paramDirection = param[paramIndex].direction;
				}

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
			return (sortValue * paramDirection);
		})
	else {
		if (byBoolean) {
			sortFunction = array.sort( (a,b) => {
				var sortValue = (a[param] === b[param])? 0 : a[param] ? -1 : 1;
				return (sortValue * direction);
			});
		} else {
			sortFunction = array.sort( (a,b) => {
				var sortValue = 0

				if (a[param] < b[param]) {
					sortValue = -1;
				} else if (a[param] > b[param]) {
					sortValue = 1;
				} else {
					sortValue = 0
				}

				return (sortValue * direction);
			})
		}

	}

	return sortFunction;
}

export { sortBy }

export function getCategories (categories) {
	var categoryList = [];

	for (var key in categories) {
		categoryList.push(categories[key])
	}

	return categoryList;
}

export function getScarcePositions (positions) {

	var scarcePositions = [];

	positions.forEach(function (position) {
		if (position.minimum) {
			scarcePositions.push(position);
		}
	});

	return scarcePositions;
}

export function getTeamNames (teams) {
	var teamNames = [];

	for (var key in teams) {
		teamNames.push(key);
	}

	return teamNames
}


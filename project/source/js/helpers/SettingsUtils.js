export const getTeamNames = (teams) => {
	const teamsArray = Object.toArray(teams)
	return teamsArray.map(team => teams.id)
}


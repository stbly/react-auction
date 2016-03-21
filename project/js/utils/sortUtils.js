const bySgp = (a,b) => {
	if (a.sgp < b.sgp)
		return -1;
	else if (a.sgp > b.sgp)
		return 1;
	else 
		return 0
}

export { bySgp }
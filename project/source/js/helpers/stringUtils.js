import { valueMatch } from './arrayUtils'

export const formatNumber = (num) => num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")

export const stringMatch = (string, query) => {
	const neuturedQuery = query.toLowerCase()
	const neuturedString = string.toLowerCase()
	const eachWordArray = neuturedString.split(' ')
	const selectionValueMatch = neuturedString.indexOf(neuturedQuery) === 0
	const searchValueMatch = valueMatch(eachWordArray, neuturedQuery, false)

	return searchValueMatch || selectionValueMatch
}

String.prototype.toNormalCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
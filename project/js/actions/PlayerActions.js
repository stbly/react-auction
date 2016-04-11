
import {players} from '../data/players'

/*export function fetchPlayers() {
	return dispatch => {
		dispatch(requestPlayers());
		get('http://example.com/api/v1/questions')
		.type('application/json')
		.accept('application/json')
		.end(function(err, res) {
			try {
				dispatch(receiveQuestions(res.body.questions));
			} catch (e) {
				console.log('GET request failed!');
			}
		});
		dispatch(receivePlayers(players));
	}
}*/

export function requestPlayers() {
   return { type: 'REQUEST_PLAYERS' }
}

export function receivePlayers(playerList) {
	console.log(players);
   return { type: 'RECEIVE_PLAYERS', players: players }
}
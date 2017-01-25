export const newPlayer = (params) => {
	return Object.assign({}, params, {
        name: null,
        type: null,
        positions: null,
        value: null,
        inflatedValue: null,
        stats: {
            default: {
                PA: null,
                AB: null,
                R: null,
                HR: null,
                RBI: null,
                SB: null,
                AVG: null,
                OBP: null,
                SLG: null,
                G: null,
                GS: null,
                IP: null,
                BB: null,
                K: null,
                W: null,
                SV: null,
                HD: null,
                ERA: null,
                WHIP: null,
                QS: null
            }
        }
	})
}
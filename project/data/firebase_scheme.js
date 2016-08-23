{
	"players": {
		"$player_id": {
			"$name": true,
			"positions": {
				"$position_id": true
			},
			"stats": {
				"$category_id": {
					"$default": true
				}
			}
		}
	},
	"users": {
		"$user_id": true,
		"leagues": {
			"$league_id": {
				"$team_id": true,
				"settings": {
					"$numTeams": true,
					"$teamSalary": true,
					"$roster_spots": true,
					"playerTypes": {
						"$player_type_id": {
							"$salary_percentage": true,
							"$roster_spots_of_type": true,
							"categories": {
								"$category_id": {
									"$name": true,
									"$abbreviation": true,
									"$sgpd": true,
									"$goal": true
								}
							}
							"positions" {
								"$position_id": {
									"$name": true,
									"$minimum": false
								}
							}
						}
					}
				},
				"teams": {
					"$team_id" {
						"$name": true,
						"$manager": true,
						"salary": {
							"$starting_salary": true,
							"$remaining_salary": true,
						}
						"players": {
							"$player_id": true
						}
					}
				}
			}
		},
		"players": {
			"$player_id": {
				"$isFavorited": false,
				"$isDrafted": false,
				"$team_id": false,
				"positions": {
					"$position_id": true
				},
				"stats": {
					"$category_id": true
				},
				"notes": {
					"$note_id": {

					}
				}
			}
		}
	}
}

// admin_id: 50fZ5hfC3mWxrNcIlHhhXrR0Rxp2
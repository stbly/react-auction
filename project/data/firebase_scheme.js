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
					"position_types": {
						"$position_type_id": {
							"$salary_percentage": true,
							"$roster_spots": true,
							"positions" {
								"$position_id": {
									"$name": true,
									"$minimum": false
								}
							}
						}
					},
					"categories": {
						"$category_id": {
							"$name": true,
							"$abbreviation": true,
							"$sgpd": true,
							"$goal": true
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
				}
				"stats": {
					"$category_id": true
				}
			}
		}
	}
}

// admin_id: 50fZ5hfC3mWxrNcIlHhhXrR0Rxp2
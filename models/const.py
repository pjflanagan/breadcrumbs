
import os

CONST = {
	"MAP": {
		"KEY": os.environ["MAPBOX_KEY"],
		"NO_INIT_MARKER": -1,
		"INIT_MARKER": 1
	},

	"CRUMB": {
		"MAX_CRUMB_CHARS": 200 # each crumb can have as many as 200 characters
	},

	"POST": {
		"MAX_CRUMBS": 12, # max of 12 points can have coments
		"MAX_MILES": 10, # max of 12 miles per post

		"VALID": 0,
		"NO_BODY": 1,
		"INVALID": 2,

		"PUBLIC": "PUBLIC",
		"ANONYMOUS": "ANONYMOUS",
		"PRIVATE": "PRIVATE",
		
		"COLORS": [
			"RED",
			"ORANGE",
			"YELLOW",
			"GREEN",
			"BLUE",
			"PINK",
			"PURPLE"
		]
	}
			
}

from const import CONST
from crumb import *

def validate_post(post):
	if "timestamp" not in post:
		post["timestamp"] = datetime.now().isoformat()

	if "title" not in post or post["title"] == "":
		return None, "Error: post must have a title"

	# if "average" not in post or not validate_lngLat(post["average"]):
	# 	return None, "Error: post must have valid average"

	if "crumbs" not in post or len(post["crumbs"]) == 0:
		return None, "Error: post must have at least one crumb"

	# visibility check
	#
	
	if "distance" not in post or post["distance"] > CONST["POST"]["MAX_MILES"]:
		return None, "Error: post must have valid distance"

	content = False
	valid = True
	for crumb in post["crumbs"]:
		validation = validate_crumb(crumb)
		if validation == CONST["POST"]["INVALID"]:
			valid = False
		elif validation == CONST["POST"]["VALID"]:
			content = True
	if valid and content: # the crumbs are all valid
		return post, None
	
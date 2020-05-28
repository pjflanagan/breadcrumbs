from const import CONST

def validate_crumb(crumb):
	# if lngLat does not have lng and lat return INVALID
	# if crumb body is too long return invalid
	if "body" not in crumb or crumb["body"] == "":
		return CONST["POST"]["NO_BODY"]
	return CONST["POST"]["VALID"]
	
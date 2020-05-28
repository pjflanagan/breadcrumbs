from lngLat import *

# error check a bounds object here
def validate_bounds(bounds):
	if "min" not in bounds:
		return "bounds do not contain min"
	elif not is_lngLat(bounds["min"]):
		return "min is not a lngLat object"

	if "max" not in bounds:
		return "bounds do not contain max"
	elif not is_lngLat(bounds["max"]):
		return "max is not a lngLat object"
	
	if greater_than_lngLat(bounds["min"], bounds["max"]):
		return "min is greater than max"

	return None
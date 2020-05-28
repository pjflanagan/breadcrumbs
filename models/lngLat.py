
def is_lngLat(obj):
	if "lng" not in obj:
		return False
	if "lat" not in obj:
		return False
	return True

def greater_than_lngLat(a, b):
	return a["lat"] > b["lat"] or a["lng"] > b["lng"]

def validate_lngLat(lngLat):
	if not is_lngLat(lngLat):
		return False
	# TODO: error check to make sure lngLat is on the map
	return True
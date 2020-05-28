import os
import urllib2
import json


# ------------------------------------------------------------------------------
# REQUIRES: ip address
# MODIFIES:
# EFFECTS: returns lng lat object
# ------------------------------------------------------------------------------
def getLngLat(ip):
	url = os.environ["IP_STACK_URL"] + str(ip) + "?access_key=" + os.environ["IP_STACK_KEY"]
	content = urllib2.urlopen(url).read()
	data = json.loads(content)
	
	lng = data["longitude"]
	lat = data["latitude"]

	# this is a bad error check
	if(lng == None): lng = 0
	if(lat == None): lat = 0

	return {"lng": lng, "lat": lat}

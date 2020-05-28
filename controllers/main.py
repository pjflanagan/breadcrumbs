# coding: utf-8
import os
from flask import *
import requests
import oauth2 as oauth
import urlparse
import json
import clients
from models import const, page

main = Blueprint(
    'main', __name__, template_folder='templates', static_folder='static')


# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS: returns the index page populated with tweets and user data
# ------------------------------------------------------------------------------
@main.route("/", methods=["GET"])
def main_route():

	# find the user's center by a cookie
	center_lng = request.cookies.get("center_lng")
	center_lat = request.cookies.get("center_lat")
	if center_lng is not None and center_lat is not None:
		lngLat = {
			"lng": float(center_lng),
			"lat": float(center_lat)
		}
	# if the user does not have a cookie set for center, find them
	elif 'HTTP_X_FORWARDED_FOR' in request.environ:
		ip = request.environ['HTTP_X_FORWARDED_FOR'] 
		lngLat = clients.ipstack.getLngLat(ip)
	# if this doesn't exist then don't getLngLat, just set to middle of world
	else:
		lngLat = {"lng": 0, "lat":0}

	options = page.make_options(session)
	options["center"] = lngLat
	options["zoom"] = 12

	return render_template("index.html", **options)

from flask import *
import datetime
import os

api_user = Blueprint('api_user', __name__, template_folder='templates')

# set the session lngLat as a callback from the get user location
@api_user.route('api/setLocation', methods=['POST'])
def api_user_set_location_route():
	data = request.get_json()

	if "lngLat" not in data:
		return 401

	session["lngLat"] = data["lngLat"]

	return 200

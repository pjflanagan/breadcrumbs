from flask import *
import os
from clients import mongo
from bson.json_util import dumps
import models

api_load = Blueprint('api_load', __name__, template_folder='templates')

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS: returns load data in form of json
# ------------------------------------------------------------------------------
@api_load.route('api/load', methods=['POST'])
def api_load_route():
	data = request.get_json()

	# error check
	if "bounds" not in data:
		return jsonify({"error": "bounds not set"}), 400

	# get the lng lat
	bounds = data["bounds"]

	err = models.validate_bounds(bounds)
	if err is not None:
		return jsonify({"error": err}), 400

	# TODO: store user's last bounds and if too similar
	# or too wide then return no data but no error

	# perhaps modify the bounds to be a little wider
	
	# get the top 20 or so posts in that area
	public_posts = mongo.load_public_posts_in_bounds(bounds, 20) #TODO: should load where PUBLIC OR ANONYMOUS
	# posts = models.anonymize(public_posts)

	# get the newest 20 or so posts in that area
	# new_posts = mongo.load_new_posts_in_bounds(bounds, "PUBLIC", 20)

	# get some additional posts from people the user follows in that area
	# following_posts = mongo.load_posts_from_following(bounds, following, 20)

	posts = public_posts

	return dumps(posts), 200 

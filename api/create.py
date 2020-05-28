from flask import *
from datetime import datetime
import os
from clients import mongo
from models import post

api_create = Blueprint('api_create', __name__, template_folder='templates')

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS:  returns the index of the post when created
# ------------------------------------------------------------------------------
@api_create.route('api/create', methods=['POST'])
def api_create_route():
	if "user_id" not in session:
		return jsonify({"error": "user not signed in"}), 400

	data = request.get_json()

	data["author_user_id"] = session["user_id"]
	data["author_screen_name"] = session["screen_name"]
	data["author_full_name"] = session["full_name"]

	validated_data, err = post.validate_post(data) 
	if err is not None:
		return jsonify({"error": err}), 400

	id = mongo.insert_post(validated_data) 
	validated_data["_id"] = {
		"$oid": str(id)
	}
	
	# TODO: ERROR CHECK RESULT

	return jsonify(validated_data), 200

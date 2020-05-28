from flask import *
import os
from clients import mongo

api_search = Blueprint('api_search', __name__, template_folder='templates')

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS:  returns the index of the post when searchd
# ------------------------------------------------------------------------------
@api_search.route('api/search', methods=['POST'])
def api_search_route():
	data = request.get_json()

	return jsonify(data), 200

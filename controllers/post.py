# coding: utf-8
import os
from flask import *
import requests
import oauth2 as oauth
import urlparse
import json
import clients
from clients import mongo
from models import const, page

post = Blueprint('post', __name__, template_folder='templates', static_folder='static')


# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS: returns the index page populated with tweets and user data
# ------------------------------------------------------------------------------
@post.route("post", methods=["GET"])
def post_route():
	id = request.args.get('id')
	crumb = int(request.args.get('crumb'))

	#TODO: error check

	post = mongo.load_post_by_id(id)
	post["_id"] = {
		"$oid": str(post["_id"])
	}

	lngLat = {
		"lng": post["crumbs"][crumb]["lngLat"]["lng"], 
		"lat": post["crumbs"][crumb]["lngLat"]["lat"]
	}

	options = page.make_options(session)
	options["center"] = lngLat
	options["zoom"] = 14
	options["post"] = post
	options["crumb_index"] = crumb
	options["crumb"] = post["crumbs"][crumb]

	return render_template("index.html", **options)

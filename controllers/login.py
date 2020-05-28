# coding: utf-8
import os
from flask import *
import requests
from flask_oauth import OAuth
from clients import s3, db
from clients import twitter as twitter_client
import urlparse, urllib
from models import page

login = Blueprint('login', __name__, template_folder='templates')
oauth = OAuth()

@login.route('login')
def login_route():
	if "screen_name" in session:
		return redirect(url_for("main.main_route"))
	options = page.make_options(session)
	options["screen_name"] = "login"
	return render_template("login.html", **options)


# ------------------------------------------------------------------------------
# Twitter Route
# ------------------------------------------------------------------------------

# Use Twitter as example remote application
twitter = oauth.remote_app('twitter', 
	# unless absolute urls are used to make requests, this will be added
	# before all URLs.  This is also true for request_token_url and others.
	base_url='https://api.twitter.com/1.1/',
	# where flask should look for new request tokens
	request_token_url='https://api.twitter.com/oauth/request_token',
	# where flask should exchange the token with the remote application
	access_token_url='https://api.twitter.com/oauth/access_token',
	# twitter knows two authorizatiom URLs.  /authorize and /authenticate.
	# they mostly work the same, but for sign on /authenticate is
	# expected because this will give the user a slightly different
	# user interface on the twitter side.
	authorize_url='https://api.twitter.com/oauth/authenticate',
	# the consumer keys from the twitter application registry.
	consumer_key=os.environ["TWITTER_CONSUMER_KEY"],
	consumer_secret=os.environ["TWITTER_CONSUMER_SECRET"]
)

@twitter.tokengetter
def get_twitter_token(token=None):
	return session.get('twitter_token')

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS: redirects to the twitter page to authorize app
# ------------------------------------------------------------------------------

@login.route('login/twitter/request', methods=['GET'])
def twitter_request_route():
	return twitter.authorize(callback=url_for('login.twitter_access_route',
		next=request.args.get('next') or request.referrer or None))

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES: sets session variable to contain user access token information
# EFFECTS: redirects to the home page
# ------------------------------------------------------------------------------
@login.route('login/twitter/access', methods=['GET'])
@twitter.authorized_handler
def twitter_access_route(resp):
	next_url = request.args.get('next') or url_for('index')
	if resp is None:
		flash(u'You denied the request to sign in.')
		return redirect(next_url)
 
	access_token = resp['oauth_token']

	# user_id is breadcrumbs user id
	# resp["user_id"] is twitter_user_id
	user_id = db.load_twitter_user(resp["user_id"])
	if user_id is None:
		user_id = db.add_twitter_user(resp)

	# update the twitter user info on s3 and in the database TODO: only do this if the new data is different / outdated
	user_data = twitter_client.get_twitter_user_data(
		resp["user_id"], 
		resp["oauth_token"], 
		resp["oauth_token_secret"])
	s3.save_profile_icon_from_url(
		user_id, 
		user_data["icon_url"])
	db.update_twitter_user(
		resp["user_id"], 
		user_data["full_name"], 
		resp['screen_name'])

	# set session variables
	session["user_id"] = user_id
	session["screen_name"] = resp['screen_name']  
	session["full_name"] = user_data["full_name"]
	session["user_type"] = "TWITTER"
	
	session['twitter_access_token'] = access_token
	session["twitter_user_id"] = resp["user_id"]
	session['twitter_token'] = (
		resp['oauth_token'],
		resp['oauth_token_secret']
	)
	
	#return redirect to main
	return redirect(url_for("main.main_route"))
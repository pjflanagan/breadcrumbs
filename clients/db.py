import MySQLdb
import MySQLdb.cursors
import urlparse
import sys
import os

algorithm = 'sha512'

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES:
# EFFECTS: returns db, a connection to database
# ------------------------------------------------------------------------------
def connect_to_database():
    url = urlparse.urlparse(os.environ["DATABASE_URL"])
    options = {
        'host': url.hostname,
        'user': url.username,
        'passwd': url.password,
        'db': 'heroku_6b02ccad46cca00',
        'cursorclass' : MySQLdb.cursors.DictCursor
    }
    db = MySQLdb.connect(**options)
    db.autocommit(True)
    return db


# ------------------------------------------------------------------------------
# REQUIRES: id is a user id
# MODIFIES:
# EFFECTS: loads access token information from database
# ------------------------------------------------------------------------------
def load_twitter_user(id):
	db = connect_to_database()
	cur = db.cursor()
	cur.execute("SELECT id FROM users WHERE TWITTER_ID=%s" % id)
	data = cur.fetchall()
	if len(data) > 0:
		return data[0]["id"]
	return None

# ------------------------------------------------------------------------------
# REQUIRES: at is access token information
# MODIFIES: adds user access token information to database
# EFFECTS:
# ------------------------------------------------------------------------------
def add_twitter_user(at):
	db = connect_to_database()
	cur = db.cursor()
	cur.execute(
		"INSERT INTO users (id, twitter_id, twitter_token, twitter_secret) VALUES(uuid(), '%s','%s','%s')" #TODO: auto store last update time (only reload/save screen_name and whatnot if enough time has past)
		% (at["user_id"], at["oauth_token"], at["oauth_token_secret"]))
	cur.execute("SELECT LAST_INSERT_ID();")
	return cur.fetchall()[0]["LAST_INSERT_ID()"]

# ------------------------------------------------------------------------------
# REQUIRES: at is access token information
# MODIFIES: adds user access token information to database
# EFFECTS:
# ------------------------------------------------------------------------------
def update_twitter_user(twitter_user_id, full_name, twitter_screen_name):
	db = connect_to_database()
	cur = db.cursor()
	cur.execute(
		"UPDATE users SET full_name='%s', twitter_screen_name='%s' WHERE twitter_id=%s" 
		% (full_name, twitter_screen_name, twitter_user_id))
	return None


import os
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import urllib2

conn = S3Connection(os.environ["AWS_ACCESS_KEY_ID"], os.environ["AWS_SECRET_ACCESS_KEY"])
bucket = conn.get_bucket(os.environ["S3_BUCKET"])

# ------------------------------------------------------------------------------
# REQUIRES: url is a valid url
# MODIFIES: saves profile picture to s3
# EFFECTS:
# ------------------------------------------------------------------------------
def save_profile_icon_from_url(user_id, url):
	#TODO: error check url

	request = urllib2.Request(url)
	response = urllib2.urlopen(request)

	#TODO: error check response

	k = Key(bucket)
	k.key = "icon/" + user_id + ".jpg"
	k.set_contents_from_string(response.read(), {'Content-Type': response.info().gettype()})
	k.set_acl('public-read')
	return

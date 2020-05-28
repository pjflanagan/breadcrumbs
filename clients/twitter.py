import os
import tweepy

# ------------------------------------------------------------------------------
# REQUIRES: session variable is set
# MODIFIES:
# EFFECTS: returns url to user icon or url to default icon
# ------------------------------------------------------------------------------
def get_twitter_user_data(twitter_user_id, token, secret): 
	auth = tweepy.OAuthHandler(os.environ["TWITTER_CONSUMER_KEY"],
							   os.environ["TWITTER_CONSUMER_SECRET"])
	auth.secure = True
	auth.set_access_token(str(token), str(secret))
	api = tweepy.API(auth)

	user = api.get_user(twitter_user_id)
	icon_url = user.profile_image_url_https #.replace("normal", "bigger")
	full_name = user.name

	return {
		"icon_url": icon_url,
		"full_name": full_name
	}
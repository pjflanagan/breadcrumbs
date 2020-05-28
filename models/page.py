# use this to return the options
import const

def make_options(session):
	#if not logged in, view anonymously
	if "user_id" not in session:
		return {
			"user_id": -1,
			"screen_name": "anonymous", 
			"CONST": const.CONST
		}
	else:
		return {
			"full_name": session["full_name"],
			"screen_name": session["screen_name"],
			"user_id": session["user_id"],
			"CONST": const.CONST
		}
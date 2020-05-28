from flask import *

logout = Blueprint('logout', __name__, template_folder='templates')

# ------------------------------------------------------------------------------
# REQUIRES:
# MODIFIES: destroys the session variable
# EFFECTS: redirects to the main login page
# ------------------------------------------------------------------------------
@logout.route('logout', methods=['GET', 'POST'])
def logout_route():
	session.pop('user_id', None)
	session.pop('screen_name', None)
	session.pop('twitter_token', None)
	return redirect(url_for('main.main_route')) #request.referrer or 

import os
from flask import Flask
import api
import controllers
import clients

app = Flask(__name__, template_folder='templates')

app.secret_key = '\xee\xfb\xfbhT\xa9_?\x9f\xd7P\xfe\xffw\x9b\xd2\xb7\xbf\x05\xc9\xf3k>m'

app.register_blueprint(controllers.main, url_prefix='/')
app.register_blueprint(controllers.login, url_prefix='/')
app.register_blueprint(controllers.logout, url_prefix='/')
app.register_blueprint(controllers.post, url_prefix='/')
#app.register_blueprint(api.api_user, url_prefix='/')
app.register_blueprint(api.api_load, url_prefix='/')
app.register_blueprint(api.api_create, url_prefix='/')
app.register_blueprint(api.api_search, url_prefix='/')

app.config["STATIC"] = os.environ["STATIC_FOLDER"]
app.config["VERSION"] = 0.15

app.config["MODE"] = os.environ["MODE"]
app.config["MAPBOX_KEY"] = os.environ["MAPBOX_KEY"]
app.config["S3_BUCKET"] = os.environ["S3_BUCKET"]

if __name__ == "__main__":
	port = int(os.environ.get("PORT", 3441))
	app.debug = os.environ["MODE"]=="DEBUG"
	app.run(host='0.0.0.0', port=port)

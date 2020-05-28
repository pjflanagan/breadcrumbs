import os
import pymongo
from bson import ObjectId

def connect_to_mongo():
	db = pymongo.MongoClient(os.environ["MONGODB_URI"]).get_database()
	return db

def insert_post(post):
	db = connect_to_mongo()
	result = db.posts.insert_one(post)
	return result.inserted_id

def load_public_posts_in_bounds(bounds, limit):
	db = connect_to_mongo()
	query = { 
		"$and" : [
			{
				"average.lng": {
					"$gt": bounds["min"]["lng"], 
					"$lt": bounds["max"]["lng"] 
				}
			},
			{ 
				"average.lat": { 
					"$gt": bounds["min"]["lat"], 
					"$lt": bounds["max"]["lat"] 
				}
			}
		]
	} 
	posts = db.posts.find(query).limit(limit)
	return posts

def load_post_by_id(id_str): #used when sharing a link
	db = connect_to_mongo()
	doc = db.posts.find_one({"_id": ObjectId(id_str)})
	return doc
// this file will NOT modify the map or the body of the 
// compose field, but instead represent a post by holding
// its data

/**
 * @class Post
 */
class Post {
	constructor() {
		this.crumbs = [];
		this.visibility = CONST.POST.PUBLIC;
		this.clear();
	}

	setTitle(t) {
		this.title = t;
	}

	setID(id) {
		console.log(id);
		this._id = {
			$oid: id
		};
	}

	crumb(i) {
		return this.crumbs[i];
	}

	addCrumb(point) {
		this.crumbs.push(new Crumb(this.crumbs.length, point));
	}

	newCrumb() {
		return this.crumbs[this.crumbs.length - 1];
	}

	setDistance(d) {
		this.distance = d;
	}

	clear() {
		this.crumbs.length = 0;
		this.title = "";
		this.average = {};
		this.distance = 0;
		this._id = {};
	}

	calculateAverage() {
		let lng = _.meanBy(this.crumbs, (crumb) => { return crumb.lngLat.lng });
		let lat = _.meanBy(this.crumbs, (crumb) => { return crumb.lngLat.lat });
		if (lng === NaN || lat === NaN) {
			this.average = {}
		}
		else {
			this.average = {
				lng: lng,
				lat: lat
			}
		}
	}

	length() {
		return this.crumbs.length;
	}

	validate() {
		this.calculateAverage();
		if (this.title === "")
			return false;
		if (this.crumbs.length === 0)
			return false;
		if (this.visibility === "") // this would never happen
			return false;
		if (this.distance > CONST.POST.MAX_MILES)
			return false;
		if (this.average === {})
			return false;

		let content = false;
		let valid = true;
		//let contentCount = 0; // not sure if this is necessary or would be annoying
		_.each(this.crumbs, function (crumb) {
			let validation = crumb.validate();
			if (validation === CONST.POST.INVALID)  // if the crumb is invalid, invalidate the post
				valid = false;
			else if (validation === CONST.POST.VALID) { // if at least 1 crumb has a body, then validate the post's content
				content = true;
				//contentCount++;
			}
		});
		return valid && content; // && contentCount <= MAX_CRUMBS crumbs must both all be valid and at least 1 most have a body
	}

	coordinateArray() {
		let coords = [];
		this.crumbs.forEach(function (crumb) {
			coords.push([crumb.lngLat.lng, crumb.lngLat.lat]);
		});
		return coords;
	}

	readyPost() {
		this.calculateAverage();
		this.timestamp = (new Date()).toISOString();
		return this.jsonify(true);
	}

	replacer(key, value) {
		if (key === "_id") return undefined;
		else return value;
	}

	jsonify(replace) {
		if (replace)
			return JSON.stringify(this, this.replacer);
		return JSON.stringify(this);
	}
}

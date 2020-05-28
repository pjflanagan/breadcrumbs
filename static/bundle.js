

// ========== 
// js/main.js 
// ========== 


/**
 * Main angular app breadcrumbs.
 * @author pjflanagan
 */
// https://stackoverflow.com/questions/43933327/python-flask-force-reload-cached-js-files
angular.module('breadcrumbs', ['ngCookies', 'ngSanitize']).config(function ($interpolateProvider, $locationProvider) {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false,
		rewriteLinks: false
	});
}).factory('Global', ["$rootScope", "$cookies", "$location", function ($rootScope, $cookies, $location) {

	$rootScope.isCreateMode = false;
	$rootScope.newPost = new Post();
	$rootScope.loading = false;

	return {

		/**
		 * Cancels the new post
		 */
		cancel: function () {
			$rootScope.isCreateMode = false;
			$rootScope.newPost.clear();
			if (!$rootScope.loading)
				$rootScope.$broadcast("cancel");
		},

		/**
		 * Sets the popup data
		 */
		popup: function (caller, post, crumb) {
			$location.path("/post").search({
				id: post._id.$oid,
				crumb: crumb.index
			});
			$rootScope.$broadcast("popup", caller, post, crumb);
		},


		/**
		 * Toggles the mode
		 */
		toggleMode: function () {
			$rootScope.isCreateMode = !$rootScope.isCreateMode;
			if (!$rootScope.isCreateMode) this.cancel();
			else $rootScope.$broadcast("createStart");
		},

		/**
		 * Focus
		 */
		focusPoint: function (isIn, i) {
			if (isIn) $rootScope.$broadcast("focus", i);
			else $rootScope.$broadcast("blur", i);
		},

		setCookie: function (key, value) {
			$cookies.put(key, value);
		},

		locate: function () {
			$rootScope.$broadcast("locate");
		},

		place: function (post) {
			$rootScope.$broadcast("place", post);
		},

		/**
		 * Sets the state loading appropriatley and 
		 * broadcasts load to be used by other controllers
		 * @method loader
		 * @param {bool} loading boolean representing if the page is loading something
		 */
		loading: function (loading) {
			$rootScope.loading = loading;
			$rootScope.$broadcast("load", {
				loading: loading,
				percent: (loading) ? Math.floor(Math.random() * 30) + 40 : 100
			});
		}
	};
}]);

// -----------------------------------------------------------------------------
// Global Functions
// -----------------------------------------------------------------------------

function isCharacterKeyPress(evt) {
	if (typeof evt.which == "undefined") {
		// This is IE, which only fires keypress events for printable keys
		return true;
	} else if (typeof evt.which == "number" && evt.which > 0) {
		// In other browsers except old versions of WebKit, evt.which is
		// only greater than zero if the keypress is a printable key.
		// We need to filter out backspace and ctrl/alt/meta key combinations
		return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
	}
	return false;
}

function kiloToMiles(k) {
	return k * 0.621371;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function displayDate(date) {
	const d = new Date(date);
	return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
	/*
	if a year ago, full date
	then do MON #
	then days ago, at most 3
	then hours
	then minutes
	*/

}

// -----------------------------------------------------------------------------
// jQuery Main
// -----------------------------------------------------------------------------

$(function () {
	$('[data-toggle="tooltip"]').tooltip()
});

// ================== 
// js/models/crumb.js 
// ================== 

/**
 * @class Crumb
 */
class Crumb {
	constructor(i, ll) {
		this.index = i;
		this.lngLat = ll;
		this.body = ""
	}

	setLngLat(lngLat) {
		// should have an error check here
		this.lngLat = lngLat;
	}

	addBody(b) {
		this.body = b;
	}

	length() {
		return this.body.length;
	}

	hasBody() {
		return this.body != "";
	}

	validate() {
		//if lngLat does not have lng and lat return INVALID
		if (this.body === "")
			return CONST.POST.NO_BODY;
		return CONST.POST.VALID;
	}
}

// ================= 
// js/models/post.js 
// ================= 

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


// =================== 
// js/models/bounds.js 
// =================== 



/**
 * @class Bounds 
 */
const Bounds = {
	coords: function (bounds) {
		return [[
			[bounds.min.lat, bounds.min.lng],
			[bounds.min.lat, bounds.max.lng],
			[bounds.max.lat, bounds.max.lng],
			[bounds.max.lat, bounds.min.lng],
			[bounds.min.lat, bounds.min.lng]
		]];
	},

	intersection: function (polyA, polyB) {
		let intersection = turf.intersect(polyA, polyB);
		if (intersection === null) {
			return 0;
		}
		let area = turf.area(intersection);
		return area;
	},

	ratio: function (a, b) {
		let polyA = turf.polygon(this.coords(a)),
			polyB = turf.polygon(this.coords(b));
		let SI = this.intersection(polyA, polyB);

		console.log(SI);
		if (SI === 0) {
			if (turf.booleanContains(polyA, polyB) || turf.booleanContains(polyB, polyA)) {
				return 1;
			}
			return 0;
		}

		let SA = turf.area(polyA);
		let SB = turf.area(polyB);
		let SU = SA + SB - SI;
		let r = SI / SU;
		return r;
	}
}

// ===================== 
// js/models/features.js 
// ===================== 

/**
 * @class Layers
 */

const Features = {
	map: function ({ lng, lat, zoom }) {
		return {
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v10',
			center: [lng, lat],
			zoom: zoom
			//style: 'mapbox://styles/mapbox/satellite-v9'
		};
	},

	geolocateControl: function () {
		return {
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true,
			showUserLocation: true
		};
	},

	line: function (post) {
		const coords = post.coordinateArray();
		return {
			"id": `line-${post._id.$oid}`,
			"type": "line",
			"source": {
				"type": "geojson",
				"data": {
					"type": "Feature",
					"properties": {},
					"geometry": {
						"type": "LineString",
						"coordinates": coords
					}
				}
			},
			"layout": {
				"line-join": "round",
				"line-cap": "round"
			},
			"paint": {
				"line-color": "#4d43da", // TODO: post.color
				"line-width": 4
			}
		}
	},

	line_descriptor: function (color = '#4d43da') {
		return {
			id: 'create-lines',
			type: 'line',
			source: 'createGeoJSON',
			layout: {
				'line-cap': 'round',
				'line-join': 'round'
			},
			paint: {
				'line-color': color,
				'line-width': 4
			},
			filter: ['in', '$type', 'LineString']
		}
	},

	distance_measure_descriptor: function () {
		return {
			id: 'create-points',
			type: 'circle',
			source: 'createGeoJSON',
			paint: {
				'circle-radius': 0,
				'circle-color': '#FFF'
			},
			filter: ['in', '$type', 'Point']
		}
	},

	point: function (lngLat, i) {
		return {
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [
					lngLat.lng,
					lngLat.lat
				]
			},
			"properties": {
				"id": i
			}
		}
	},

	create_line_string: function () {
		return {
			"type": "Feature",
			"geometry": {
				"type": "LineString",
				"coordinates": []
			}
		};
	},

	feature_collection: function () {
		return {
			"type": "FeatureCollection",
			"features": []
		};
	}
}

// ================ 
// js/models/map.js 
// ================ 

// FIXME: this probably shouldn't have rootScope and Global

/** 
 * ----------------------------------------------------------------------------
 * @class MapCreatorMode
 * ----------------------------------------------------------------------------
 */
class MapCreatorMode {
	constructor(map, scope, rootScope, Global) {
		this.scope = scope;
		this.rootScope = rootScope;
		this.Global = Global;
		this.map = map;

		this.createGeoJSON = Features.feature_collection(); // GeoJSON object to hold our measurement features
		this.createLineString = Features.create_line_string(); // Used to draw a line between points
		this.createMarkers = [];
	}

	mapLoad() {
		this.map.addSource('createGeoJSON', {
			"type": "geojson",
			"data": this.createGeoJSON
		});

		// Add styles to the map
		this.map.addLayer(Features.distance_measure_descriptor());
	}

	click(lngLat, newPostLength) {
		this.addPoint(lngLat, newPostLength);
		const valid = this.addLines();
		if (valid) this.addCreateMarker(lngLat, newPostLength);
		else this.removePoint(newPostLength);
	}

	addPoint(lngLat, i) {
		// Remove the LineString from the group
		// So we can redraw it based on the points collection
		// LineString is always the top feature
		this.removeLines();

		let point = Features.point(lngLat, i);
		this.createGeoJSON.features.splice(i, 0, point);
	}

	removePoint(i) {
		this.createGeoJSON.features = this.createGeoJSON.features.filter(function (feature) {
			if (feature.geometry.type === 'Point' && feature.properties.id === i)
				return false;
			return true;
		});
	}

	addLines() {
		if (this.createGeoJSON.features.length > 1) {
			this.createLineString.geometry.coordinates = this.createGeoJSON.features.map(function (point) {
				return point.geometry.coordinates;
			});
			let dist = turf.lineDistance(this.createLineString);
			if (dist > CONST.POST.MAX_MILES)
				return false;

			this.rootScope.newPost.setDistance(dist);
			this.createGeoJSON.features.push(this.createLineString);
		}
		else
			this.rootScope.newPost.setDistance(0);

		this.map.getSource('createGeoJSON').setData(this.createGeoJSON);
		return true;
	}

	removeLines() {
		this.createGeoJSON.features = this.createGeoJSON.features.filter(function (feature) {
			return feature.geometry.type !== 'LineString';
		});
	}

	addCreateMarker(lngLat, newPostLength) {
		let self = this;
		// add to map
		let el = document.createElement('div');
		el.lngLat = lngLat;
		el.index = newPostLength;
		el.className = 'marker purple marker-add marker-sm';
		let marker = new mapboxgl.Marker({
			draggable: true,
			element: el
		})
			.setLngLat([lngLat.lng, lngLat.lat])
			.addTo(this.map);
		this.createMarkers.push(marker);

		// record globally
		this.rootScope.newPost.addCrumb(lngLat);
		this.rootScope.$apply();

		marker.on("dragstart", function (event) {
			let i = marker.getElement().index;
			self.lngLatDragHolder = marker.getElement().lngLat;
			self.removePoint(i);
			//this.addLines(); // this will remove and replace the line where this point was
		});

		marker.on("dragend", function (event) {
			let i = marker.getElement().index;
			let lngLat = marker.getLngLat();
			self.addPoint(lngLat, i);
			let valid = self.addLines();
			if (!valid) {
				self.removeLines();
				self.removePoint(i);
				lngLat = self.lngLatDragHolder;
				marker.setLngLat(lngLat); // move the marker back to the old spot
				self.addPoint(lngLat, i);
				self.addLines(); // then add the lines again
			}
			marker.getElement().lngLat = lngLat;
			self.rootScope.newPost.crumb(i).setLngLat(lngLat); // FIXME:
		});
	}

	getFocusElement(i) {
		return this.createMarkers[i].getElement();
	}

	getBlurElement(i) {
		return this.createMarkers[i].getElement();
	}

	cancel() {
		this.createGeoJSON.features = [];
		this.addLines();
		this.map.getSource('createGeoJSON').setData(this.createGeoJSON);

		this.createMarkers.forEach(marker => {
			marker.remove();
		});
		this.createMarkers = [];
	}

}

/**
 * ----------------------------------------------------------------------------
 * @class MapDisplayMode
 * ----------------------------------------------------------------------------
 */
class MapDisplayMode {
	constructor(map, scope, rootScope, Global) {
		this.scope = scope;
		this.rootScope = rootScope;
		this.Global = Global;
		this.map = map;

		// popup
		const popupEl = document.getElementById("popup");
		this.popup = new mapboxgl.Popup({ offset: 12 })
			.setDOMContent(popupEl)
			.addTo(this.map);

		this.popup.on("close", function () { $(".marker").removeClass("focus"); });

		this.loadedPosts = [];
	}

	mapLoad() {
		if (this.initMarker != CONST.MAP.NO_INIT_MARKER) {
			this.Global.popup("mapController", INIT.POST, INIT.CRUMB); // FIXME: 
			this.initMarker.togglePopup(); // this gets set in insertPost
		}
	}

	moveend() {
		if (this.map.getZoom() < 12.5) // don't load posts if zoomed too far out
			return;
		const center = this.map.getCenter();
		this.Global.setCookie("center_lng", center.lng); // FIXME:
		this.Global.setCookie("center_lat", center.lat); // FIXME:

		this.locationTimeout = setTimeout(() => this.scope.loadPosts(), 600); // wait to load posts for about half a second
	}

	/**
	 * @method insertPosts
	 */
	insertPosts(posts) {
		const self = this;
		// diff the arrays to make sure you don't re add
		const newPosts = _.differenceBy(posts, this.loadedPosts, "_id.$oid");

		// add all the new ones
		newPosts.forEach(function (postData) {
			const post = _.assign(new Post, postData);
			self.insertPost(post);
		})
	};

	/** 
	 * @method insertPost
	 */
	insertPost(post) {
		let self = this;

		console.log(post);
		if (post.length() > 1)
			this.map.addLayer(Features.line(post));

		post.crumbs.forEach(function (crumb) {
			self.insertCrumb(post, crumb);
		});

		this.loadedPosts.push(post);
	}

	insertCrumb(post, crumbJSON) {
		let crumb = _.assign(new Crumb, crumbJSON);
		let el = document.createElement('div');
		el.index = crumb.index;
		el.lngLat = crumb.lngLat;
		el.post = post;
		el.crumb = crumb;
		el.className = `marker purple ${(crumb.body != "") ? "marker-lg" : ""}`; // TODO: post.color for class name
		if (crumb.index === 0) {
			$(el).append(`<p class="post-title">${post.title}</p>`);
		}
		$(el).attr("identifier", post._id.$oid + "-" + crumb.index);

		let marker = new mapboxgl.Marker({
			draggable: false,
			element: el
		})
			.setLngLat([crumb.lngLat.lng, crumb.lngLat.lat])
			.setPopup(this.popup)
			.addTo(this.map);

		el.marker = marker;
		if (this.initMarker === CONST.MAP.INIT_MARKER) this.initMarker = marker;
	}

	popupEvent(post, crumb) {
		this.popup.setLngLat([crumb.lngLat.lng, crumb.lngLat.lat]);

		let el = $(`[identifier="${post._id.$oid + "-" + crumb.index}"]`);
		$(".marker").removeClass("focus");
		el.addClass("focus");
	}

}

/**
 * ----------------------------------------------------------------------------
 * @class MapDirector
 * ----------------------------------------------------------------------------
 */
class MapDirector {
	constructor(lng, lat, zoom, scope, rootScope, Global) {
		this.scope = scope;
		this.rootScope = rootScope;
		this.Global = Global;
		let self = this;

		mapboxgl.accessToken = CONST.MAP.KEY;
		this.map = new mapboxgl.Map(Features.map({ lng, lat, zoom }));
		this.creator = new MapCreatorMode(this.map, scope, rootScope, Global);
		this.loader = new MapDisplayMode(this.map, scope, rootScope, Global);

		// gelocate
		this.geolocateControl = new mapboxgl.GeolocateControl(Features.geolocateControl());
		this.map.addControl(this.geolocateControl);

		this.map.on("load", function () { self.init(); });
		this.map.on("click", function (event) { self.scope.click(event); });
		this.map.on("movestart", function () { clearTimeout(self.locationTimeout); });
		this.map.on("moveend", function () { self.moveend(); }); //TODO: make this call the parent moveend?
	}

	mapLoad() {
		this.creator.mapLoad();
		this.map.addLayer(Features.line_descriptor());
		this.loader.mapLoad();
	}

	/**
	 * @method init
	 */
	init() {
		if (INIT.POST === 0) {
			this.loader.initMarker = CONST.MAP.NO_INIT_MARKER;
			this.geolocateControl.trigger();
		}
		else {
			this.loader.initMarker = CONST.MAP.INIT_MARKER;
			const post = _.assign(new Post, INIT.POST);
			this.loader.insertPost(post);
		}
		this.Global.loading(false); // FIXME:
		this.mapLoad();
	}

	// Create

	createClick(lngLat, newPostLength) {
		this.creator.click(lngLat, newPostLength);
	}

	getFocusElement(i) {
		return this.creator.getFocusElement(i);
	}

	getBlurElement(i) {
		return this.creator.getBlurElement(i);
	}

	// Load

	load() {
		this.loader.load();
	}

	insertPosts(posts) {
		this.loader.insertPosts(posts);
	}

	insertPost(post) {
		this.loader.insertPost(post);
	}

	moveend() {
		this.loader.moveend();
	}

	getPosition() {
		let mapBounds = this.map.getBounds();
		let bounds = {
			"min": mapBounds._sw,
			"max": mapBounds._ne
		};
		let center = this.map.getCenter();
		let zoom = this.map.getZoom();
		return { bounds, center, zoom };
	}


	// Events

	locate() {
		this.geolocateControl.trigger();
	}

	popupEvent(post, crumb) {
		this.loader.popupEvent(post, crumb);
	}

	cancel() {
		this.creator.cancel();
	}
}

// ================================== 
// js/controllers/headerController.js 
// ================================== 

angular.module('breadcrumbs').controller('headerController', ['$scope', '$http', '$rootScope', '$timeout', 'Global', function ($scope, $http, $rootScope, $timeout, Global) {


	// -------------------------------------------------------------------------
	// Init
	// -------------------------------------------------------------------------

	/**
	 * Initializes the header 
	 * @method init
	 */
	$scope.init = function () {
		$scope.createPrompt = "add post"
	}


	// -------------------------------------------------------------------------
	// Methods
	// -------------------------------------------------------------------------

	/**
	 * Toggles mode
	 * @method toggleMode
	 */
	$scope.toggleMode = function () {
		Global.toggleMode();
	}

	/**
	 * Locates the user
	 * @method locate
	 */
	$scope.locate = function () {
		// Global.locate();
	}

	/**
	 * @method searchInput
	 */
	$scope.searchInput = function () {
		if (event.keyCode !== 13) {
			return;
		}
		if ($rootScope.loading) {
			// TODO: show wait message
			return false;
		}

		Global.loading(true);

		let req = {
			method: 'POST',
			url: '/api/search',
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				query: $scope.searchQuery
			}
		}

		$http(req)
			.then(function (response) {
				console.log(response);
				Global.loading(false);
				Global.cancel();
			}, function (error) {
				console.log(error); // TODO: show error message
				Global.loading(false);
			});
	}

	// -------------------------------------------------------------------------
	// Events
	// -------------------------------------------------------------------------

	/**
	 * @event cancel
	 */
	$scope.$on("cancel", function (event) {
		$scope.createPrompt = "add post";
	});

	/**
	 * @event createStart
	 */
	$scope.$on("createStart", function (event) {
		$scope.createPrompt = "cancel post";
	});

	/**
	 * Makes the loading bar load
	 * @event load
	 * @param {Object} event
	 * @param {Object} args contains the percent
	 */
	$scope.$on("load", function (event, args) {
		$("#loading").css({
			opacity: "1",
			width: `${args.percent}%`
		});
		if (!args.loading) {
			// a better way to do this would be apply a css class 
			// that has this as an annimation
			$timeout(function () { $("#loading").css("opacity", "0") }, 1000);
			$timeout(function () { $("#loading").css("width", "0%") }, 1400);
		}

	});

}]);

// ================================= 
// js/controllers/loginController.js 
// ================================= 

angular.module('breadcrumbs').controller('loginController', ['$scope', '$http', '$rootScope', '$timeout', 'Global', function ($scope, $http, $rootScope, $timeout, Global) {


}]);

// =================================== 
// js/controllers/sidebarController.js 
// =================================== 

angular.module('breadcrumbs').controller('sidebarController', ['$scope', '$http', '$rootScope', '$timeout', 'Global', function ($scope, $http, $rootScope, $timeout, Global) {

	// -------------------------------------------------------------------------
	// Init
	// -------------------------------------------------------------------------

	$scope.init = function () {
		$scope.visibility = CONST.POST.PUBLIC;
		$scope.focusIndex = -1;
	}

	// -------------------------------------------------------------------------
	// Methods
	// -------------------------------------------------------------------------

	/**
	 * @method changeVisibility
	 */
	$scope.changeVisibility = function (type) {
		$scope.visibility = type;
		$rootScope.newPost.visibility = type;
	}

	/**
	 * Toggles mode
	 * @method toggleMode
	 */
	$scope.toggleMode = function () {
		Global.toggleMode();
	}

	/**
	 * @method focus
	 */
	$scope.focus = function (i) {
		$scope.focusIndex = i;
		Global.focusPoint(true, i);
	}

	/**
	 * @method blur
	 */
	$scope.blur = function (i) {
		$scope.focusIndex = -1;
		Global.focusPoint(false, i);
	}

	/**
	 * @method cancel
	 */
	$scope.cancel = function () {
		Global.cancel();
	}

	/**
	 * @method post
	 */
	$scope.post = function () {
		if ($rootScope.loading) {
			// TODO: show wait message
			return false;
		}

		if (!$rootScope.newPost.validate()) {
			// TODO: show error message
			return;
		}

		Global.loading(true);

		let req = {
			method: 'POST',
			url: '/api/create',
			headers: {
				'Content-Type': 'application/json'
			},
			data: $rootScope.newPost.readyPost()
		}

		$http(req)
			.then(function (response) {
				Global.place(response.data);
				Global.loading(false);
				Global.cancel();
			}, function (error) {
				console.log(error); // TODO: show error message
				Global.loading(false);
			});
	}

	/**
	 * @method keydown
	 */
	$scope.keydown = function (i, e) {
		if (isCharacterKeyPress(e) && $rootScope.newPost.crumb(i).length() === CONST.CRUMB.MAX_CHARS) {
			e.preventDefault();
		}
	}

}]);

// ================================= 
// js/controllers/popupController.js 
// ================================= 

angular.module('breadcrumbs').controller('popupController', ['$scope', '$http', '$rootScope', '$timeout', 'Global', function ($scope, $http, $rootScope, $timeout, Global) {


	$scope.init = function () {
		$scope.initVisibility = true;
		$scope.prev = 0;
		$scope.next = 0;
	}

	$scope.arrows = function () {
		// find the crumb to the left
		$scope.prev = 0;
		for (let i = $scope.crumb.index - 1; i >= 0; i--) {
			let c = $scope.post.crumb(i);
			if (c === undefined) {
				break;
			}

			c = _.assign(new Crumb(), c);
			if (c.hasBody()) {
				$scope.prev = $scope.post.crumb(i);
				break;
			}
		}

		$scope.next = 0;
		for (let i = $scope.crumb.index + 1; i < $scope.post.length(); i++) {
			let c = $scope.post.crumb(i);
			if (c === undefined) {
				break;
			}

			c = _.assign(new Crumb(), c);
			if (c.hasBody()) {
				$scope.next = $scope.post.crumb(i);
				break;
			}
		}
	}

	$scope.left = function () {
		if ($scope.prev === 0)
			return;
		Global.popup("popupController", $scope.post, $scope.prev);
	}

	$scope.right = function () {
		if ($scope.next === 0)
			return;
		Global.popup("popupController", $scope.post, $scope.next);
	}

	$scope.popup = function (post, crumb) {
		$scope.post = _.assign(new Post, post);
		$scope.formattedTimestamp = displayDate($scope.post.timestamp);

		$scope.crumb = _.assign(new Crumb, crumb);
		$scope.arrows();
	}

	$scope.$on("popup", function (event, caller, post, crumb) {
		$scope.popup(post, crumb);
		if (caller != "popupController")
			$scope.$apply();
	});

}]);

// =============================== 
// js/controllers/mapController.js 
// =============================== 

// FIXME: this should have popup

angular.module('breadcrumbs').controller('mapController', ['$scope', '$http', '$rootScope', '$timeout', 'Global', function ($scope, $http, $rootScope, $timeout, Global) {

	// -------------------------------------------------------------------------
	/* #region Init */

	/**
	 * Initializes the header 
	 * @method init
	 */
	$scope.init = function (lng, lat, zoom) {
		Global.loading(true);
		$scope.map = new MapDirector(lng, lat, zoom, $scope, $rootScope, Global);
		$scope.previous = {};
	}

	/* #endregion */
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	/* #region Create */

	/**
	 * @method click
	 * @param {event} event
	 */
	$scope.click = function (event) {
		if (!$rootScope.isCreateMode || $rootScope.loading) {
			let el = event.originalEvent.target;
			// TODO: if the element is not a marker
			if (el.marker === undefined) {
				console.log("NOT A MARKER");
				return;
			}
			Global.popup("mapController", el.post, el.crumb);
			return;
		}
		event.preventDefault();

		$scope.map.createClick(event.lngLat, $rootScope.newPost.length())
	}

	/* #endregion */
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	/* #region Load */

	/** 
	 * @method loadPosts
	 */
	$scope.loadPosts = function () {
		const { bounds, center, zoom } = $scope.map.getPosition();
		console.log({ bounds, center, zoom });

		if ($scope.similar(bounds, zoom)) return;

		$scope.previous = {
			"bounds": bounds,
			"center": center,
			"zoom": zoom
		}

		let req = {
			method: 'POST',
			url: '/api/load',
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				"bounds": bounds
			}
		};

		$http(req)
			.then(function (response) {
				$scope.map.insertPosts(response.data);
			}, function (error) {
				console.log(error); // TODO: show error message
			});
	};

	/** 
	 * @method similar
	 */
	$scope.similar = function (bounds, zoom) {
		if ($scope.previous.zoom === undefined || $scope.previous.bounds === undefined) return false; // console.log("first load");
		if (Math.abs(zoom - $scope.previous.zoom) > 0.8) return false; // console.log("not similar zoom");

		let ratio = Bounds.ratio($scope.previous.bounds, bounds);
		if (ratio < 0.4) return false; // console.log("not similar area");

		console.log('reload');

		return true;
	}

	/* #endregion  */
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	/* #region Events */

	/**
	 * @event focus
	 */
	$scope.$on("focus", function (event, i) { //TODO: rename create-focus
		let el = $scope.map.getFocusElement(i);
		$(el).removeClass("marker-sm");
		$(el).addClass("focus marker-lg");
	});

	/**
	 * @event blur
	 */
	$scope.$on("blur", function (event, i) { // TODO: rename create-blur
		let el = $scope.map.getBlurElement(i);
		if ($rootScope.newPost.crumb(i).hasBody()) {
			$(el).removeClass("focus");
		}
		else {
			$(el).removeClass("focus marker-lg");
			$(el).addClass("marker-sm");
		}
	});

	/**
	 * @event cancel
	 */
	$scope.$on("cancel", function (event) {
		$scope.map.cancel();
	});

	/**
	 * @event locate
	 */
	$scope.$on("locate", function (event) {
		$scope.map.locate();
	});

	/**
	 * @event place
	 */
	$scope.$on("place", function (event, postData) {
		let post = _.assign(new Post, postData);
		$scope.map.insertPost(post);
	})

	/**
	 * @event popup
	 */
	$scope.$on("popup", function (event, caller, post, crumb) {
		$scope.map.popupEvent(post, crumb);
	});

	/* #endregion */
	// -------------------------------------------------------------------------

}]);
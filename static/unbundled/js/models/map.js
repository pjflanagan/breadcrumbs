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
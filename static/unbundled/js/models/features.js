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
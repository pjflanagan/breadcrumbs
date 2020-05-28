

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
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
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
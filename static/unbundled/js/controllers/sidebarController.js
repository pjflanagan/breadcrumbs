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
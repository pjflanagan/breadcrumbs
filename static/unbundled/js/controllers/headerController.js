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
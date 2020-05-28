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
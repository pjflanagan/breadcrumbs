
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
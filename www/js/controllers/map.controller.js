

angular
    .module('bilbonApp.controllers')
    .controller('MapCtrl', MapController);

MapController.$inject = ['$scope', '$rootScope', '$state', '$ionicPlatform', '$ionicPopup', '$window', '$filter', 
						'$timeout', 'Map', 'UserLocalStorage'];

/**
 * Controller - Main page (map)
 */
function MapController(
	$scope,
	$rootScope, 
	$state, 
	$ionicPlatform,
	$ionicPopup,  
	$window, 
	$filter,
	$timeout,  
	Map,
	UserLocalStorage) {

	// recalculate map's height based on screen's height
	var screenHeight = $window.innerHeight - 105;
	var mapElement = angular.element( document.querySelector( '#mapa' ) );
	mapElement.css('height', screenHeight + 'px');

	// initialize map and filter's Google Autocomplete's object
	var map = initializeMap(document.getElementById('mapa')); 
	Map.setMap(map);

	var autocomplete = loadGooglePlacesAutocompleteFeature(document.getElementById('location-input'), Map, $ionicPopup);
	Map.setAutocomplete(autocomplete);

	// load default filter when the app starts and shows the first page (the map)
	$ionicPlatform.ready(function() {
		// Enable the first category by default when the page loads (see config/categories.js).
		// In this case loads the 'restaurantes-sidrerias-y-bodegas-de-euskadi' category (of a official dataset)
		$scope.filter.selectedCategories[0] = true; // enable category's checkbox
		$scope.callDatasetCategoriesFilter(0);      // apply the filter

		// Enable "also citizens' POIs filter" by default to search the created one when the page loads 
		// (in this case of 'restaurantes-sidrerias-y-bodegas-de-euskadi' category)
		$scope.filter.selectedCitizensPOIs = true; // enable filter's checkbox
		$scope.citizenPOIsSelectionChanged();      // apply the filter
	});

	// run when map's red button is clicked 
	$scope.createPOI = function(){
		if(UserLocalStorage.getUserId() == null){
	        $ionicPopup.confirm({
                title: $filter('translate')('map-page.aac-error-popup-title'),
                template: $filter('translate')('map-page.aac-error-popup-text'),
                cancelText: $filter('translate')('map-page.aac-error-popup-cancel-button-label'),
                cancelType: 'button-default',
                okText: $filter('translate')('map-page.aac-error-popup-login-button-label'),
                okType: 'button-assertive'
            }).then(function(res) { if(res) { $state.go('app.login'); } });
            return;
		}else{
			$state.go('app.create'); // go to form's page
		}
	}

	// when this view is opened, resize map to avoid 'grey' parts on in 
	// (it failed on return from '$state.go(app.map)' for example)
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if(toState.name == 'app.map'){
			 $timeout(function() { 
			 	Map.closeAndRemoveInfoWindow();
			 	var center = Map.getMap().getCenter();
            	google.maps.event.trigger(Map.getMap(), 'resize');
				Map.getMap().setCenter(center);
            }, 1850);  
			
		}
	});

	// Do logout. Clean login local data (user profile and OAuth data)
	$scope.doLogout = function(){
		UserLocalStorage.removeUserData(); // remove user profile data if it is already stored (name, surname, socialId, userId)
		UserLocalStorage.removeOAuthData(); // remove user's OAuth session data (accessToken, refreshToken, expiresIn, tokenType, scope)

		// show logout message
		var myPopup = $ionicPopup.show({
			template: "<center>" + $filter('translate')('info-alert-popup-logout-label') + "</center>",
			cssClass: 'custom-class custom-class-popup'
		});
		$timeout(function() { myPopup.close(); }, 1600); //close the popup after 1.6 seconds 
	};

}

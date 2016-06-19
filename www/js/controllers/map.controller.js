
bilbonAppControllers
    .controller('MapCtrl', MapCtrl);

MapCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicPopup', '$window', '$filter', '$timeout', 'Map', 'UserLocalStorage'];

/**
 * Controller - Main page (map)
 */
function MapCtrl(
	$scope,
	$rootScope, 
	$state, 
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

	// when this view is opened, resize map to avoid 'grey' parts on in (it failed on return from '$state.go(app.map)')
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if(toState.name == 'app.map'){
			 $timeout(function() { 
            	google.maps.event.trigger(Map.getMap(), 'resize');
				Map.getMap().setCenter(Map.getMap().getCenter());
            }, 1850);  
			
		}
	});

}


bilbonAppControllers
    .controller('MapCtrl', mapCtrl);


/**
 * Controller - Main page (map)
 */
function mapCtrl(
	$scope, 
	$state, 
	$ionicPopup,  
	$window, 
	$filter, 
	$http, 
	Map) {

	// recalculate map's height based on screen's height
	var screenHeight = $window.innerHeight - 105;
	var mapElement = angular.element( document.querySelector( '#mapa' ) );
	mapElement.css('height', screenHeight + 'px');

	// initialize map's variables
	/*var infoWindowArray = null; // array of initialized markers
	$scope.currentMarkerZoneId = null;
	$scope.currentMarkerTitle = null; // 
	$scope.proposalsCountByZones = [];*/

	// manage infoWindow's content's language
	//$scope.proposalLabel_sing = $filter('translate')('proposal-map-page.proposals-label-sing');
	//$scope.proposalLabel_plu = $filter('translate')('proposal-map-page.proposals-label-plu');
	// monitorize language changing
	/*$scope.$watchGroup(
	  [ function() { return $filter('translate')('proposal-map-page.proposals-label-sing'); },
	    function() { return $filter('translate')('proposal-map-page.proposals-label-plu'); }],

	  function(newval, oldval, scope) { 
	    $scope.proposalLabel_sing = newval[0];
	    $scope.proposalLabel_plu = newval[1];

	    // if a marker's infoWindow is opened, update its content based on selected language, even if
	    // the language changing happens in the same map's page
	    if(infoWindowArray != null && $scope.currentMarkerZoneId != null){
	      infoWindowArray[$scope.currentMarkerZoneId].setContent(
	        // if a marker's infoWindow is opened, change its content because of language changing
	        getInfoWindowContent($scope.currentMarkerZoneId, $scope.currentMarkerTitle, 
	                             $scope.proposalsCountByZones, $scope.proposalLabel_sing, $scope.proposalLabel_plu)
	      );
	    }
	  } 
	);*/

	// get proposals count of each zone
	/*$http({
	method: 'GET',
	url: BILBOZKATU_BB_URL + '/proposal/zones/count',
	timeout: 10000
	}).then(function successCallback(successCallback) {

	    // this callback will be called asynchronously when the successCallback is available
	    var response_data = successCallback.data;
	    if(!response_data.hasOwnProperty('message')){  
	        $scope.proposalsCountByZones = response_data;
	    } // else response_data.message is "There are no proposals in the database"

	  }, function errorCallback(errorCallback) {
	    $ionicPopup.alert({
	        title: $filter('translate')('error-alert-popup-title'),
	        template: $filter('translate')('proposal-map-page.proposals-count-error-label'),
	        okText: $filter('translate')('error-alert-popup-ok-button-label'),
	        okType: 'button-assertive' 
	    });
	  }

	).finally(
	  function finallyCallback(callback, notifyCallback){
	    // initialize the map (with or without data about proposals' count)
	    infoWindowArray = initialize($scope.proposalsCountByZones, $scope);
	  }
	);*/



	var map = initializeMap(document.getElementById('mapa')); 
	Map.setMap(map);

	var autocomplete = loadGooglePlacesAutocompleteFeature(document.getElementById('location-input'), Map, $ionicPopup);
	Map.setAutocomplete(autocomplete);



	//console.log('despues initializacion, map: ', $scope.map);

}

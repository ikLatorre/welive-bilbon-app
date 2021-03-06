

angular
    .module('bilbonApp.controllers')
    .controller('CreatePOICtrl', CreatePOIController);

CreatePOIController.$inject = ['$scope', '$state', '$stateParams', '$filter', '$timeout', '$ionicLoading', 
						'$http', '$ionicHistory', '$ionicPopup', 'WELIVE_DATASET_API_URL', 'UserLocalStorage', 'KPI'];

/**
 * Controller - Create new POI 
 */
function CreatePOIController(
	$scope, 
	$state, 
	$stateParams, 
	$filter,
	$timeout, 
	$ionicLoading,
	$http, 
	$ionicHistory, 
    $ionicPopup,
    WELIVE_DATASET_API_URL,
    UserLocalStorage,
    KPI) {

	// the categories' combobox uses '$scope.translatedCategories', definied in controllers.js (its $scope is inherited 
	// because 'AppCtrl' controller is abstract)

	// define objecto to store form's data
	$scope.newPOI = {};
	$scope.newPOI.documentName = '';
	$scope.newPOI.documentDescription = '';
	$scope.newPOI.category = '';
	$scope.newPOI.web = '';
	$scope.newPOI.email = '';
	$scope.newPOI.phoneNumber = '';
	$scope.newPOI.latitudelongitude = '';

	// set values of other properties
	$scope.newPOI.municipalityCode = 480020;
	$scope.newPOI.municipality = 'BILBAO';
	$scope.newPOI.historicTerritoryCode = 48;
	$scope.newPOI.historicTerritory = 'BIZKAIA';
	$scope.newPOI.country = 'España';
	$scope.newPOI.territory = 'BIZKAIA';

	// specify regex pattern for phone number validation
	// pattern: 9 digits with, maybe, some spaces between them; optionally preceded by country code with these formats: '+34' or '0034'
	$scope.phoneREGEXP = /^\s*(\+\d{2}|00\d{2})?(\s*\d\s*\d\s*\d\s*){3}$/i;

	// define variable to manage location and the marker
	var currentMarker = null;

	// define variable to store the category info of the new POI (this info is obtained from config/categories.js
	// of the official items which id range is from 0 to 'number of categories-1')
	// initialized in 'sendPOItoCitizensDataset()' and used in '$scope.submitPOI()' to show the corresponding
	// alert message if the new POI's category is disabled in the filter
	var createdPOIcategoryInfo = null;

	// define object to manage location (text input and error messages)
	$scope.location = {};  //only do this if $scope.course has not already been declared
	$scope.location.showLocationRequiredMsg = false; // hide error message the first time
	$scope.location.locationAutocompleteInput = ''; // empty Google Autocomplete's object's input
	$scope.location.showLocationBoundsErrorMsg = false; 

	//Set bounds for location selection and Google Autocomplete. 
	// Construct a rectangle from the points at its south-west and north-east corners
	var bilbaoBounds = new google.maps.LatLngBounds(  
	        new google.maps.LatLng(43.199927, -3.017116),   //south-west corner
	        new google.maps.LatLng(43.310109, -2.827070));  //north-east corner

	// initialize map object
	var map = initializeMap(document.getElementById('mapa-creation-poi'));
	// change map's marker when the user clicks on it
	map.addListener('click', function(event){
		changeMarker(event.latLng);
	});

	// load Google Autocomplete object binding it to the corresponding object
	loadGoogleAutocomplete();

	// run when form's 'submit' button is clicked to send the new POI to citizens' datasets
	$scope.submitPOI = function(){
		// check if the user has selected a location (required field)
		if($scope.newPOI.latitudelongitude == ''){ 
			$scope.location.showLocationRequiredMsg = true; 
			return;
		}

		// send POI's information and check the response
		sendPOItoCitizensDataset()
		.then(function(){ // success
			console.log('POI successfully submited! ', $scope.newPOI);

			// KPI when a user creates a new POI
			KPI.POIAdded('null', $scope.newPOI.documentName, $scope.newPOI.latitudelongitude)
			.then(function(successCallback){
              console.log("'POIAdded' KPI logged");
            }, function(errorCallback){
              console.log("Error logging 'POIAdded' KPI", errorCallback);
            });

			$ionicLoading.hide();		

			var myPopup; // used to show an alert message 2.5 secs

			// check if the new POI's category is enabled in the filter, and show the corresponding alert message
            if($scope.filter.selectedCategories[createdPOIcategoryInfo['id']] == true){
            	myPopup = $ionicPopup.show({
					template: "<center>" + $filter('translate')('poi-create-page.info-alert-popup-label') + "</center>",
					cssClass: 'custom-class custom-class-popup'
				});
            }else{
            	myPopup = $ionicPopup.show({
					template: "<center>" + $filter('translate')('poi-create-page.info-alert-popup-label-no-category') + "</center>",
					cssClass: 'custom-class custom-class-popup'
				});
            }

            $timeout(function() { 

                //return to main map's page
                $ionicHistory.nextViewOptions({ disableBack: true }); // Avoid back button in the next view
                $state.go('app.map'); //$ionicHistory.clearCache().then(function(){ $state.go('app.map')});

            	myPopup.close(); //close the popup after 2 seconds 

            }, 2500).then(function(){ 
            	// enable "also citizens' POIs filter" to search the created one 
                // if the corresponding category is selected, otherwise the rest of the enabled categories
                $scope.filter.selectedCitizensPOIs = true; // enable filter checkbox
                $scope.citizenPOIsSelectionChanged(); // activate filter, or force a reload of it
            }); 

		}, function(error){
			console.log('Error sending new POI information.');
			$ionicLoading.hide();
			$ionicPopup.alert({
	            title: $filter('translate')('poi-create-page.error-popup-title'),
	            template: $filter('translate')('poi-create-page.error-popup-text'),
	            okText: $filter('translate')('poi-create-page.error-ok-button-label'),
	            okType: 'button-assertive' 
	        });
		});

	};





	// change map's marker to another location (location is a 'google.maps.LatLng(lat, lng)' object) if exists,
	// or create new one and set on the map otherwise.
	function changeMarker(location){
		// show error alert if the new location is invalid (it isn't in bilbao)
		if(!bilbaoBounds.contains(location)){
			$scope.location.showLocationBoundsErrorMsg = true;
		}else{
			$scope.location.showLocationBoundsErrorMsg = false;
		}

		// create marker and hide 'required location' alert if neccesary
		if(currentMarker != null){
    		currentMarker.setPosition(location);
		}else{
			currentMarker = new google.maps.Marker({
				position: location,
				map: map,
				icon: 'img/location_icon.png'
			});
		}
		map.setCenter(location);

		// tell angular that variable has changed (hide location selected error if it is showing)
		$scope.$apply(function(){ $scope.location.showLocationRequiredMsg = false; });
		$scope.newPOI.latitudelongitude = location.lat() + ',' + location.lng();
		console.log('Stored location: ', $scope.newPOI.latitudelongitude);
	};

	// define Google Autocomplete object
	function loadGoogleAutocomplete(){
	    // (Google Places) Create the autocomplete object, restricting the search to geographical location types.
	    var domInputElement = document.getElementById('map-creation-location-input');
	    var autocompleteObj = new google.maps.places.Autocomplete(
			(domInputElement), {
	            types : [ 'geocode' ],
	            componentRestrictions: { country: 'es' },
	            bounds: bilbaoBounds //The area in which to search for places. 
	                                 // Results are biased towards, but not restricted to, places contained within these bounds.
	        }
	    );
	    google.maps.event.addListener(autocompleteObj, 'place_changed',
	        function() {
	            console.log('"place_changed" event fired.');
	            // If the user press 'enter' with the searcher, but without selecting an item from the list
	            // or occurring some kind of error getting the place
	            if(autocompleteObj.getPlace() == null || !autocompleteObj.getPlace().geometry
	        		|| (autocompleteObj.getPlace() != null && domInputElement.value == autocompleteObj.getPlace().name)){ 
	                    
	                    // remove marker if exist
	                    if(currentMarker != null) currentMarker.setMap(null); // remove previous marker
	                    currentMarker = null;

	                    // remove previously selected location coordinates
	                    $scope.$apply(function(){ $scope.newPOI.latitudelongitude = ''; });

	                    // remove location error of 'location out of bounds' and empty input textbox
	                    $scope.$apply(function(){ $scope.location.showLocationBoundsErrorMsg = false; });
	                    $scope.$apply(function(){ $scope.location.locationAutocompleteInput = '';  });

	                    // center the map
	                    map.setZoom(14);
    					map.setCenter(new google.maps.LatLng(43.263606, -2.935214)); // Plaza de Don Federico Moyúa, Bilbao
	                         
	                    // show error alert
	                    $ionicPopup.alert({
				            title: $filter('translate')('poi-create-page.location-gmaps-error-popup-title'),
				            template: $filter('translate')('poi-create-page.location-gmaps-error-popup-text'),
				            okText: $filter('translate')('poi-create-page.location-gmaps-error-ok-button-label'),
				            okType: 'button-assertive' 
				        });
	                    console.log('Location removed.');
	            }else{
	            		// get selected place and reload the marker if exists, or create a new one
	                    var lat = autocompleteObj.getPlace().geometry.location.lat();
	          			var lng = autocompleteObj.getPlace().geometry.location.lng();
	          			changeMarker(new google.maps.LatLng(lat, lng));
	            }
	        }
	    );
	};

	// send POI's information to citizen's dataset
	// Returns a promise: if success, the api's response; otherwise error.
	function sendPOItoCitizensDataset(){
		$ionicLoading.show({ template: '<ion-spinner icon="bubbles"></ion-spinner><br/>'
                                    + $filter('translate')('poi-create-page.loading-text')
   		});
		
   		var datasetID = null;
   		var jsonID = null;

   		// get 'categoryCustomNumericId' with selected category official id (official datasetID)
   		var categoryCustomNumericId = null;
   		var categoryInfo = categories.filter( function(item){ // (see config/categories.js)
	      return (item.datasetId == $scope.newPOI.category && item.isOfficial == true); 
	    });
   		if(categoryInfo != null){ 
   			createdPOIcategoryInfo = categoryInfo[0];
   			categoryCustomNumericId = categoryInfo[0]['categoryCustomNumericId']; 
   		}

   		// use 'categoryCustomNumericId' to get citizen's datasetID+jsonID to the selected category
   		categoryInfo = categories.filter( function(item){
	      return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == false); 
	    });
	    if(categoryInfo != null){
	    	// get citizens' dataset data
	    	datasetID = categoryInfo[0]['datasetId'];
	    	jsonID = categoryInfo[0]['jsonId'];
	    } 

	    // 'transaction' parameter of the URL: enable transaction mode for multiple update execution
		var datasetCall = {
	        params : {
	            method: 'POST',
	            url: WELIVE_DATASET_API_URL + datasetID + '/resource/' + jsonID + '/update?transaction=false',
	            headers: {	'Content-Type': 'text/plain',
			    			'Accept': 'application/json',
			    			'Authorization': 'Bearer ' + UserLocalStorage.getAccessToken()  },
	            sqlStatement: "INSERT INTO POIS (id, documentName, documentDescription, web, email, phoneNumber,"
	            			+ " latitudelongitude, category, municipalityCode, municipality, historicTerritoryCode,"
	            			+ " historicTerritory, country, territory) VALUES"
	            			+ " (null, '" + $scope.newPOI.documentName + "', '" + $scope.newPOI.documentDescription + "'," 
	            			+ " '" + $scope.newPOI.web + "', '" + $scope.newPOI.email + "', '" + $scope.newPOI.phoneNumber + "'," 
	            			+ " '" + $scope.newPOI.latitudelongitude + "', '" + $scope.newPOI.category + "'," 
	            			+ " " + $scope.newPOI.municipalityCode + ", '" + $scope.newPOI.municipality + "'," 
	            			+ " " + $scope.newPOI.historicTerritoryCode + ", '" + $scope.newPOI.historicTerritory + "'," 
	            			+ " '" + $scope.newPOI.country + "', '" + $scope.newPOI.territory + "');",
	            timeout: 7000
	        }
	    };
	
	    // call the corresponding dataset to filter by category and, maybe, by text
	    return $http({
				method: datasetCall.params.method,
				url:  datasetCall.params.url,
				headers: datasetCall.params.headers,
				data: datasetCall.params.sqlStatement, 
				timeout: datasetCall.params.timeout
		});
	}

}
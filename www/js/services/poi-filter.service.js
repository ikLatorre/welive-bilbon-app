

angular
      .module('bilbonApp.services')
      .factory('FilteredPOIs', FilteredPOIs);

FilteredPOIs.$inject = ['$http', '$state', '$q', '$ionicLoading', 'WELIVE_DATASET_API_URL', 'KPI']; 

/**
 * @desc Store searched POIs and manage the filtering 
 */
function FilteredPOIs(
	$http, 
	$state, 
	$q, 
	$ionicLoading, 
	WELIVE_DATASET_API_URL, 
	KPI) { 

	// each item of the array is identified by 'categoryCustomNumericId', and contains all the filetred POIs of 
	// the corresponding category (see 'config/categories.js')
	// (each item will contain the response of the api, an object with 'count' and 'rows' properties)
	var officialPOIs = [];
	var citizenPOIs = [];

	// object to store location filter's position (used in Map service to show the marker)
	var locationFilterCoords = {}; 
	locationFilterCoords.latitude = null;
	locationFilterCoords.longitude = null;
	// flag to avoid obtaining location coordinates for each category and type (official or not).
	// get it only once in the filter process (see 'callSelectedLocationFilter()' and 'getDeviceLocation()')
	locationFilterCoords.areCoordsStored = false; 

	initializePOIs();

	// define service's methods
	var filter = {
		callCategoryAndTextFilter: callCategoryAndTextFilter,
		callSelectedLocationFilter: callSelectedLocationFilter,
		getOfficialFilteredPOIs: getOfficialFilteredPOIs,
		getCitizensFilteredPOIs: getCitizensFilteredPOIs,
		getPOI: getPOI,
		initializePOIs: initializePOIs,
		removeCategoryPOIs: removeCategoryPOIs,
		getPositionFilterCoords: getPositionFilterCoords,
		setPositionFilterCoords: setPositionFilterCoords,
		arePositionFilterCoordsStored: arePositionFilterCoordsStored,
		setPositionFilterCoordsStored: setPositionFilterCoordsStored
    };
    return filter;

    // get POIs of dataset filtered by category and, if neccesary, by text. Returns a promise (the 'response'
    // if success; rejected promise otherwise).
    function callCategoryAndTextFilter(categoryCustomNumericId, isOfficial, textInput) {
    	var promise;
    	promise = $q(function (resolve, reject) {

	    	// manage the text filter
	    	var sqlTextQueryClause = "";
	    	if(textInput != null){
	    		var textQueryAux = " LIKE '%" + textInput + "%' ";
	     		sqlTextQueryClause = " AND (documentName " + textQueryAux + " OR documentDescription " + textQueryAux
	                        	+ " OR web " + textQueryAux + " OR email " + textQueryAux + " OR country " + textQueryAux
	                        	+ " OR territory " + textQueryAux + " OR municipality " + textQueryAux
	                        	+ " OR historicTerritory " + textQueryAux + ") "; 
	    	}

	    	// get parameters based on if the request is to an official dataset or not.
	    	// official POIs' each dataset corresponds to one category; citizen POIs are stored in the same dataset, identified
	    	// by 'category' field
	    	var datasetID = "";
	    	var jsonID = "";
	    	var sqlIdFieldName = null;
	    	var sqlTableName = null;
	    	var sqlCategoryQueryClause = ""; // in case of citizens' dataset
	    	var categoryID = ""; // store categoryID (categoryID = official datasetID = citizens' dataset's 'category' field)
	    	
			var officialCategoryInfo = categories.filter( function(item){ //'categories' array is defined in config/categories.js
				return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == true); 
			});
		    if(officialCategoryInfo != null) categoryID = officialCategoryInfo[0]['datasetId'];
			else reject(); 

	    	if(isOfficial){
	    		datasetID = officialCategoryInfo[0]['datasetId']; // same as 'categoryID'
	    		jsonID = officialCategoryInfo[0]['jsonId'];
	    		sqlIdFieldName = "_id";
	    		sqlTableName = "rootTable";
	    	}else{
	    		var citizenCategoryInfo = categories.filter( function(item){ 
					return (item.categoryCustomNumericId == categoryCustomNumericId && item.isOfficial == false); 
				});
			    if(citizenCategoryInfo != null){
			    	datasetID = citizenCategoryInfo[0]['datasetId'];;
	    			jsonID = citizenCategoryInfo[0]['jsonId'];
				}else reject(); 
				sqlIdFieldName = "id";
				sqlTableName = "POIS";
	    		sqlCategoryQueryClause = " AND category LIKE '" + categoryID + "' ";
	    	}

	    	// construct url and query statements
	    	var datasetCall = {
		        params : {
		            method: 'POST',
		            url: WELIVE_DATASET_API_URL + datasetID + '/resource/' + jsonID + '/query',
		            headers: {	"Content-Type": "text/plain",
				    			"Accept": "application/json"  },
		            sqlQuery: " SELECT " + sqlIdFieldName + " AS id, documentName, documentDescription, latitudelongitude, web, "
	                		+ " phoneNumber, email, country, territory, municipality, municipalityCode, "
	                		+ " historicTerritory, historicTerritoryCode "
	                		+ " FROM " + sqlTableName 
		            		+ " WHERE municipalityCode = 480020 " + sqlTextQueryClause + sqlCategoryQueryClause + ";",
		            timeout: 6000
		        }
		    };
		    console.log('Getting items from "' + datasetCall.params.url + '"...');

		    // KPI when new POIs are searched with SQL statement
			KPI.POIsSearched(datasetCall.params.sqlQuery)
			.then(function(successCallback){
              console.log("'POIsSearched' KPI logged");
            }, function(errorCallback){
              console.log("Error logging 'POIsSearched' KPI", errorCallback);
            });

		    // call the corresponding dataset to filter by category and, maybe, by text
	    	$http({
				method: datasetCall.params.method,
				url:  datasetCall.params.url,
				headers: datasetCall.params.headers,
				data: datasetCall.params.sqlQuery, // select from Bilbao (municipalityCode = 480020)
				timeout: datasetCall.params.timeout
		    }).then(function successCallback(successCallback) {
		    		// this callback will be called asynchronously when the successCallback is available
		    		if(isOfficial) officialPOIs[categoryCustomNumericId] = successCallback.data;
			    	else citizenPOIs[categoryCustomNumericId] = successCallback.data;
			    	console.log('Obtained respone: ', successCallback.data);
			    	resolve(successCallback.data);
		        }, function errorCallback(errorCallback) {
		        	if(isOfficial) officialPOIs[categoryCustomNumericId] = {};
			    	else citizenPOIs[categoryCustomNumericId] = {};
		        	reject();
		        }
		    );

    	});

    	return promise;
    };

    // remove from stored POIs those that doesn't match the location filter.
    // if 'latitude' and 'longitude' parameters are null, get gps location. otherwise they contain google autocomplete's location.
    // Returns a promise: resolved if success or rejected with 'errorType' parameter: 'gps-error' or 'bounds-error'
    function callSelectedLocationFilter(categoryCustomNumericId, isOfficial, latitude, longitude) {
    	var promise;
    	promise = $q(function (resolve, reject) {
    		if(latitude == null && longitude == null){
    			// get device's gps location
    			getDeviceLocation()
    			.then(function(positionCoords){ // success getting device's location
    				// here, e.g., we also have 'positionCoords.accuracy'
    				applyLocationFilter(categoryCustomNumericId, isOfficial, positionCoords.latitude, positionCoords.longitude)
    				.then(function(filteredArray){ // success filtering
    					resolve(filteredArray); // resolve 'callSelectedLocationFilter()'s promise
    				}, function(){
    					// the POIs array is null
    					reject('bounds-error'); // reject 'callSelectedLocationFilter()'s promise
    				});

    			}, function(){ // error getting device's location
    				reject('gps-error'); // reject 'callSelectedLocationFilter()'s promise
    			});
    		}else{
    			// use already getted Google Autocomplete's location, apply the filter

    			// store Google Places' coordinates to show the corresponding marker of the location filter
    			setPositionFilterCoords(latitude, longitude);
    			setPositionFilterCoordsStored(true);

    			applyLocationFilter(categoryCustomNumericId, isOfficial, latitude, longitude)
				.then(function(filteredArray){ // success filtering
					resolve(filteredArray); // resolve 'callSelectedLocationFilter()'s promise
				}, function(){
					// the POIs array is null
					reject('bounds-error'); // reject 'callSelectedLocationFilter()'s promise
				});
    		}


    	});

    	return promise;
    };
    
    // return the official POIs array
    function getOfficialFilteredPOIs() {
    	return officialPOIs;
    };

    // return the citizens' POIs array
    function getCitizensFilteredPOIs() {
    	return citizenPOIs;
    };

    // get an obtained (filtered) POI's object
    function getPOI(isOfficial, categoryCustomNumericId, POI_ID) {
    	var poiInfo = null;
    	var datasetResults = null;

    	if(isOfficial) datasetResults = officialPOIs[categoryCustomNumericId];
    	else datasetResults = citizenPOIs[categoryCustomNumericId]; 

    	if(datasetResults != null && datasetResults.hasOwnProperty("rows")){
			// in official datasets the 'id' field is '_id', but in the SELECT query we use 'id' alias for it
			poiInfo = datasetResults.rows.filter( function(item){ return item['id'] == POI_ID; } );
		}

    	if(poiInfo != null && poiInfo.length > 0) return poiInfo[0];
    	else return null;
    };

    // initialize POIs' arrays for each category. 'categories' is definied in 'config/categories.js'
    function initializePOIs() {
    	officialPOIs = [];
    	citizenPOIs = [];

    	// arrays cannot have "string indexes", that's why 'categoryCustomNumericId' numeric parameter is used
    	// 'categories' array is defined in 'config/categories.js'
		angular.forEach(categories, function(item, key){
			if(item.isOfficial == true){
				officialPOIs[item.categoryCustomNumericId] = {}; // initialize array's item for that category's POIs
			}else{
				citizenPOIs[item.categoryCustomNumericId] = {}; // initialize array's item for that category's POIs
			}
		});
    };

    // remove POIs from a specific category and type (official or not)
    function removeCategoryPOIs(categoryCustomNumericId, isOfficial){
    	console.log('Removing POIs...', categoryCustomNumericId, isOfficial);
    	if(isOfficial){
    		officialPOIs[categoryCustomNumericId] = {};
    	}else{
    		citizenPOIs[categoryCustomNumericId] = {};
    	}
    }

    // returns an object representing the coordinates of the selected location filter position 
    // in 'latitude' and 'longitude' properties if they're stored. null otherwise.
    function getPositionFilterCoords(){
    	if(locationFilterCoords.latitude != null && locationFilterCoords.longitude != null){
    		return locationFilterCoords;
    	}else{
    		return null;
    	}
    }

    // sets the positionn of the selected location filter (it is used in 'applyLocationFilter()' and 'place_changed'
    // event of 'map.js')
    function setPositionFilterCoords(lat, lng){
    	locationFilterCoords.latitude = lat;
    	locationFilterCoords.longitude = lng;
    }

    // returns true if the location filter's coords have been already obtained in the filter process; false otherwise.
    // (used to avoid obtaining device's gps position for each category and type of the filter process)
    // (once the device's gps position has been obtained at the begining of the filter process, 
    // this position will be used elsewhere in the process)
    function arePositionFilterCoordsStored(){
    	return locationFilterCoords.areCoordsStored;
    }

    // sets if the location filter's coordinates are already stored or not (true | false)
    // (used in 'Map' service once the filter process has finished, to force to get again
    // the device's gps location in the next filter process if necessary)
    function setPositionFilterCoordsStored(areStored){
    	locationFilterCoords.areCoordsStored = areStored;
    }






    // ** Define auxiliary functions used in functions of 'filter' variable **

    // Used in callSelectedLocationFilter(...) function to get device's location.
    // Returns a promise: 'deviceLat', 'deviceLng' and 'accuracy' parameters if resolved; reject otherwise.
    function getDeviceLocation(){
    	var promise;
    	promise = $q(function (resolve, reject) {

    		if(arePositionFilterCoordsStored() == false){

    			ionic.Platform.ready(function(){
					/*var deviceInformation = ionic.Platform.device();
			        var isWebView = ionic.Platform.isWebView();
			        var isIPad = ionic.Platform.isIPad();
			        var isIOS = ionic.Platform.isIOS();
			        var isAndroid = ionic.Platform.isAndroid();
			        var isWindowsPhone = ionic.Platform.isWindowsPhone();
			        var currentPlatform = ionic.Platform.platform();
			        var currentPlatformVersion = ionic.Platform.version();*/

					// will execute when device is ready, or immediately if the device is already ready.
					var options = {
					  enableHighAccuracy: true,
					  timeout: 10000,
					  maximumAge: 0
					};
					function success(position){
						console.log('Device location: ', position.coords.latitude, position.coords.longitude);

						// store Google Places' coordinates to show the corresponding marker of the location filter
		    			setPositionFilterCoords(position.coords.latitude, position.coords.longitude);
		    			setPositionFilterCoordsStored(true);

						resolve(position.coords);
					};
					function error(error){
						// error.code = error.PERMISSION_DENIED | POSITION_UNAVAILABLE | TIMEOUT | UNKNOWN_ERROR
					 	reject();
					};
					// Try HTML5 geolocation.
					if ("geolocation" in navigator) { // Check if Geolocation is supported (also with 'navigator.geolocation')
						// get device's location using GPS, IP or Wifi ('location' must be enabled on the device)
						navigator.geolocation.getCurrentPosition(success, error, options);
					}else{
					  console.log('geolocaiton IS NOT available');
					  reject();
					}
				});

			}else{
				// the device's gps location has been obtained at the begining of the 'filter process',
				// so avoid looking for it again
				resolve(getPositionFilterCoords()); 
			}

    		
    	});

    	return promise;
    }

    // Used in callSelectedLocationFilter(...) function to apply location filter to specific category array. 
    // It overrides the corresponding POIs' array removing the POI that is not near de selected location. Returns a promise.
    function applyLocationFilter(categoryCustomNumericId, isOfficial, lat, lng){

    	// in this point 'lat' and 'lng' parameters refers to the selected coordinates of location filter (gps|google places)
    	// store the coordinates to show the selected position as a marker in the map 
    	// (see 'Map' service using this service's 'getPositionFilterLatLng()')
    	//setPositionFilterCoords(lat, lng);

    	var promise;
    	promise = $q(function (resolve, reject) {
    		var datasetResults = null;

	    	if(isOfficial) datasetResults = officialPOIs[categoryCustomNumericId];
	    	else datasetResults = citizenPOIs[categoryCustomNumericId]; 

	    	// get category array of POIs if exists (reject() promise otherwise)
    		if(datasetResults != null && datasetResults.hasOwnProperty("rows")){
    			// override existing POIs by filtered ones (datasetResults.rows has the reference to real array)
    			var sw = new google.maps.LatLng(Number(lat) - 0.0035, Number(lng) - 0.0035);
				var ne = new google.maps.LatLng(Number(lat) + 0.0035, Number(lng) + 0.0035);
				var bounds = new google.maps.LatLngBounds(sw, ne); // set bounds (more or less 500m of radius)
				
				var previousPOICount = datasetResults.rows.length;

				// remove from the corresponding POIs array that ones that are not near the selected location
				datasetResults.rows = datasetResults.rows.filter(poiIsContained, bounds);

				var removedPOIsCount = previousPOICount - datasetResults.rows.length;
				console.log('Finished location filter with ' + datasetResults.rows.length + ' POIs '
					+ '(removed ' + removedPOIsCount + '/' + previousPOICount + ' POIs)');
				// official dataset's could contain the same POI twice

				resolve(datasetResults.rows);
    		}else{
    			reject();
    		}
    	});

    	return promise;
    }
    
	// function to be run for each element in 'filter' 'datasetResults.rows' array of applyLocationFilter(...)
	// 'this' value is the optional parameter passed by 'filter' function: google maps' 'bounds' function
	function poiIsContained(item, index, array) {
		var coordinatesLatLng =  item.latitudelongitude.split(",");
		var poiLatLng = new google.maps.LatLng(Number(coordinatesLatLng[0]), Number(coordinatesLatLng[1]));
		if(coordinatesLatLng[0] == null || coordinatesLatLng[1] == null){
			return false;
		} 
		else{
			return this.contains(poiLatLng);
		} 
	}

}